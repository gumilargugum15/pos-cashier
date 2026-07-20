<?php

namespace App\Repositories\Eloquent;

use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseRepository implements PurchaseRepositoryInterface
{
    private const SORTABLE = ['purchase_number', 'grand_total', 'status', 'payment_status', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Purchase::query()->with(['supplier', 'creator', 'items']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('purchase_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($sq) => $sq->where('name', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (! empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Purchase
    {
        return Purchase::with(['supplier', 'creator', 'items'])->find($id);
    }

    public function countForToday(): int
    {
        return Purchase::whereDate('created_at', now())->count();
    }

    public function create(array $purchaseData, array $items): Purchase
    {
        return DB::transaction(function () use ($purchaseData, $items) {
            $purchase = Purchase::create($purchaseData);

            foreach ($items as $item) {
                $purchase->items()->create($item);
            }

            return $purchase->fresh(['supplier', 'creator', 'items']);
        });
    }

    public function updateWithItems(Purchase $purchase, array $purchaseData, array $items): Purchase
    {
        return DB::transaction(function () use ($purchase, $purchaseData, $items) {
            $purchase->update($purchaseData);
            $purchase->items()->delete();

            foreach ($items as $item) {
                $purchase->items()->create($item);
            }

            return $purchase->fresh(['supplier', 'creator', 'items']);
        });
    }

    public function save(Purchase $purchase): Purchase
    {
        $purchase->save();

        return $purchase->fresh(['supplier', 'creator', 'items']);
    }

    public function delete(Purchase $purchase): void
    {
        $purchase->delete();
    }

    public function purchasesReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $active = fn () => Purchase::whereBetween('created_at', [$from, $to])->where('status', '!=', 'cancelled');
        $all = fn () => Purchase::whereBetween('created_at', [$from, $to]);

        $summary = $active()->selectRaw('
            COALESCE(SUM(grand_total),0) as total,
            COUNT(*) as count,
            COALESCE(SUM(paid_amount),0) as paid_total
        ')->first();

        $byStatus = $all()
            ->selectRaw('status, COUNT(*) as count, SUM(grand_total) as total')
            ->groupBy('status')
            ->get();

        $byPaymentStatus = $active()
            ->selectRaw('payment_status, COUNT(*) as count, SUM(grand_total) as total')
            ->groupBy('payment_status')
            ->get();

        $trend = $active()
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $total = (float) $summary->total;
        $paidTotal = (float) $summary->paid_total;

        return [
            'total' => $total,
            'count' => (int) $summary->count,
            'paid_total' => $paidTotal,
            'outstanding_total' => round($total - $paidTotal, 2),
            'by_status' => $byStatus->map(fn ($r) => [
                'status' => $r->status,
                'count' => (int) $r->count,
                'total' => (float) $r->total,
            ])->values(),
            'by_payment_status' => $byPaymentStatus->map(fn ($r) => [
                'payment_status' => $r->payment_status,
                'count' => (int) $r->count,
                'total' => (float) $r->total,
            ])->values(),
            'trend' => $trend->map(fn ($r) => [
                'date' => $r->date,
                'total' => (float) $r->total,
                'count' => (int) $r->count,
            ])->values(),
        ];
    }

    public function taxPaid(\DateTimeInterface $from, \DateTimeInterface $to): float
    {
        return (float) Purchase::where('status', '!=', 'cancelled')
            ->whereBetween('created_at', [$from, $to])
            ->sum('tax_amount');
    }

    public function supplierReportRows(\DateTimeInterface $from, \DateTimeInterface $to): Collection
    {
        return Purchase::where('purchases.status', '!=', 'cancelled')
            ->whereBetween('purchases.created_at', [$from, $to])
            ->join('suppliers', 'suppliers.id', '=', 'purchases.supplier_id')
            ->selectRaw('suppliers.id as supplier_id, suppliers.name as supplier_name,
                COUNT(*) as order_count,
                SUM(purchases.grand_total) as total_purchased,
                MAX(purchases.created_at) as last_order_at')
            ->groupBy('suppliers.id', 'suppliers.name')
            ->orderByDesc('total_purchased')
            ->get()
            ->map(fn ($r) => [
                'supplier_id' => (int) $r->supplier_id,
                'supplier_name' => $r->supplier_name,
                'order_count' => (int) $r->order_count,
                'total_purchased' => (float) $r->total_purchased,
                'avg_order_value' => $r->order_count > 0
                    ? round((float) $r->total_purchased / $r->order_count, 2)
                    : 0.0,
                'last_order_at' => $r->last_order_at,
            ])
            ->values();
    }
}
