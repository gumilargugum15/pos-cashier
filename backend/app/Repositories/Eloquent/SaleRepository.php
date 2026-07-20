<?php

namespace App\Repositories\Eloquent;

use App\Models\Sale;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SaleRepository implements SaleRepositoryInterface
{
    private const SORTABLE = ['invoice_number', 'grand_total', 'status', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Sale::query()->with(['customer', 'cashier', 'items']);

        if (! empty($filters['search'])) {
            $query->where('invoice_number', 'like', "%{$filters['search']}%");
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (! empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
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

    public function find(int $id): ?Sale
    {
        return Sale::with(['customer', 'cashier', 'items'])->find($id);
    }

    public function countForToday(): int
    {
        return Sale::whereDate('created_at', now())->count();
    }

    public function create(array $saleData, array $items): Sale
    {
        return DB::transaction(function () use ($saleData, $items) {
            $sale = Sale::create($saleData);

            foreach ($items as $item) {
                $sale->items()->create($item);
            }

            return $sale->fresh(['customer', 'cashier', 'items']);
        });
    }

    public function save(Sale $sale): Sale
    {
        $sale->save();

        return $sale->fresh(['customer', 'cashier', 'items']);
    }

    public function totalForDate(\DateTimeInterface $date): float
    {
        return (float) Sale::where('status', 'paid')
            ->whereDate('created_at', $date)
            ->sum('grand_total');
    }

    public function profitForDate(\DateTimeInterface $date): float
    {
        return (float) DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.status', 'paid')
            ->whereDate('sales.created_at', $date)
            ->selectRaw('SUM(sale_items.qty * (sale_items.price - sale_items.cost_price)) as profit')
            ->value('profit') ?? 0.0;
    }

    public function countForDate(\DateTimeInterface $date): int
    {
        return Sale::where('status', 'paid')
            ->whereDate('created_at', $date)
            ->count();
    }

    public function cashTotalForDate(\DateTimeInterface $date): float
    {
        return (float) Sale::where('status', 'paid')
            ->where('payment_method', 'cash')
            ->whereDate('created_at', $date)
            ->sum('grand_total');
    }

    public function cashTotalForRange(\DateTimeInterface $from, \DateTimeInterface $to): float
    {
        return (float) Sale::where('status', 'paid')
            ->where('payment_method', 'cash')
            ->whereBetween('created_at', [$from, $to])
            ->sum('grand_total');
    }

    public function pendingCount(): int
    {
        return Sale::where('status', 'pending')->count();
    }

    public function salesTrend(int $days): Collection
    {
        $result = collect();

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);

            $result->push([
                'date' => $date->toDateString(),
                'day' => $date->format('D'),
                'sales' => $this->totalForDate($date),
                'profit' => $this->profitForDate($date),
            ]);
        }

        return $result;
    }

    public function paymentMethodBreakdown(\DateTimeInterface $date): Collection
    {
        $rows = Sale::where('status', 'paid')
            ->whereDate('created_at', $date)
            ->selectRaw('payment_method, SUM(grand_total) as total')
            ->groupBy('payment_method')
            ->get();

        $grandTotal = (float) $rows->sum('total');

        return $rows->map(fn ($row) => [
            'name' => $row->payment_method,
            'value' => $grandTotal > 0 ? round(((float) $row->total / $grandTotal) * 100, 1) : 0.0,
        ]);
    }

    public function salesByCategory(\DateTimeInterface $since): Collection
    {
        return DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('sales.status', 'paid')
            ->where('sales.created_at', '>=', $since)
            ->selectRaw('categories.name as name, SUM(sale_items.subtotal) as value')
            ->groupBy('categories.name')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'value' => (float) $row->value,
            ]);
    }

    public function latestTransactions(int $limit): Collection
    {
        return Sale::with(['customer', 'items'])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Sale $sale) => [
                'id' => $sale->invoice_number,
                'customer' => $sale->customer?->name ?? 'Walk-in',
                'items' => $sale->items->count(),
                'method' => $sale->payment_method,
                'time' => $sale->created_at->format('H:i'),
                'total' => (float) $sale->grand_total,
                'status' => match ($sale->status) {
                    'paid' => 'Paid',
                    'refunded' => 'Refunded',
                    'void' => 'Void',
                    default => 'Pending',
                },
            ]);
    }

    public function salesReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $paid = fn () => Sale::whereBetween('created_at', [$from, $to])->where('status', 'paid');
        $all = fn () => Sale::whereBetween('created_at', [$from, $to]);

        $summary = $paid()->selectRaw('
            COALESCE(SUM(grand_total),0) as total,
            COUNT(*) as count,
            COALESCE(SUM(discount_amount),0) as discount_total,
            COALESCE(SUM(tax_amount),0) as tax_total
        ')->first();

        $byPaymentMethod = $paid()
            ->selectRaw('payment_method, COUNT(*) as count, SUM(grand_total) as total')
            ->groupBy('payment_method')
            ->get();

        $byStatus = $all()
            ->selectRaw('status, COUNT(*) as count, SUM(grand_total) as total')
            ->groupBy('status')
            ->get();

        $trend = $paid()
            ->selectRaw('DATE(created_at) as date, SUM(grand_total) as total, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $count = (int) $summary->count;

        return [
            'total' => (float) $summary->total,
            'count' => $count,
            'discount_total' => (float) $summary->discount_total,
            'tax_total' => (float) $summary->tax_total,
            'avg' => $count > 0 ? round(((float) $summary->total) / $count, 2) : 0.0,
            'by_payment_method' => $byPaymentMethod->map(fn ($r) => [
                'method' => $r->payment_method,
                'count' => (int) $r->count,
                'total' => (float) $r->total,
            ])->values(),
            'by_status' => $byStatus->map(fn ($r) => [
                'status' => $r->status,
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

    public function profitReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $base = fn () => DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.status', 'paid')
            ->whereBetween('sales.created_at', [$from, $to]);

        $totals = $base()->selectRaw('
            COALESCE(SUM(sale_items.qty * sale_items.price),0) as revenue,
            COALESCE(SUM(sale_items.qty * sale_items.cost_price),0) as cost
        ')->first();

        $revenue = (float) $totals->revenue;
        $cost = (float) $totals->cost;
        $profit = $revenue - $cost;

        $trend = $base()
            ->selectRaw('DATE(sales.created_at) as date,
                SUM(sale_items.qty * sale_items.price) as revenue,
                SUM(sale_items.qty * sale_items.cost_price) as cost')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $byCategory = $base()
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->selectRaw('categories.name as category,
                SUM(sale_items.qty * sale_items.price) as revenue,
                SUM(sale_items.qty * sale_items.cost_price) as cost')
            ->groupBy('categories.name')
            ->orderByDesc('revenue')
            ->get();

        return [
            'revenue' => $revenue,
            'cost' => $cost,
            'profit' => $profit,
            'margin_percent' => $revenue > 0 ? round(($profit / $revenue) * 100, 2) : 0.0,
            'trend' => $trend->map(fn ($r) => [
                'date' => $r->date,
                'revenue' => (float) $r->revenue,
                'cost' => (float) $r->cost,
                'profit' => (float) $r->revenue - (float) $r->cost,
            ])->values(),
            'by_category' => $byCategory->map(fn ($r) => [
                'category' => $r->category,
                'revenue' => (float) $r->revenue,
                'cost' => (float) $r->cost,
                'profit' => (float) $r->revenue - (float) $r->cost,
            ])->values(),
        ];
    }

    public function taxCollected(\DateTimeInterface $from, \DateTimeInterface $to): float
    {
        return (float) Sale::where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('tax_amount');
    }

    public function customerReportRows(\DateTimeInterface $from, \DateTimeInterface $to): Collection
    {
        return Sale::where('sales.status', 'paid')
            ->whereBetween('sales.created_at', [$from, $to])
            ->whereNotNull('sales.customer_id')
            ->join('customers', 'customers.id', '=', 'sales.customer_id')
            ->selectRaw('customers.id as customer_id, customers.name as customer_name,
                COUNT(*) as order_count,
                SUM(sales.grand_total) as total_spent,
                MAX(sales.created_at) as last_order_at')
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total_spent')
            ->get()
            ->map(fn ($r) => [
                'customer_id' => (int) $r->customer_id,
                'customer_name' => $r->customer_name,
                'order_count' => (int) $r->order_count,
                'total_spent' => (float) $r->total_spent,
                'avg_order_value' => $r->order_count > 0 ? round((float) $r->total_spent / $r->order_count, 2) : 0.0,
                'last_order_at' => $r->last_order_at,
            ])
            ->values();
    }

    public function bestSellingReport(\DateTimeInterface $from, \DateTimeInterface $to, int $limit): Collection
    {
        return DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->join('products', 'products.id', '=', 'sale_items.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('sales.status', 'paid')
            ->whereBetween('sales.created_at', [$from, $to])
            ->selectRaw('products.id as product_id, products.name as product_name, products.sku as sku,
                categories.name as category_name,
                SUM(sale_items.qty) as qty_sold,
                SUM(sale_items.qty * sale_items.price) as revenue,
                SUM(sale_items.qty * (sale_items.price - sale_items.cost_price)) as profit')
            ->groupBy('products.id', 'products.name', 'products.sku', 'categories.name')
            ->orderByDesc('qty_sold')
            ->limit($limit)
            ->get()
            ->map(fn ($r) => [
                'product_id' => (int) $r->product_id,
                'product_name' => $r->product_name,
                'sku' => $r->sku,
                'category_name' => $r->category_name,
                'qty_sold' => (int) $r->qty_sold,
                'revenue' => (float) $r->revenue,
                'profit' => (float) $r->profit,
            ])
            ->values();
    }
}
