<?php

namespace App\Repositories\Eloquent;

use App\Models\StockMovement;
use App\Repositories\Contracts\StockMovementRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class StockMovementRepository implements StockMovementRepositoryInterface
{
    private const SORTABLE = ['reference_number', 'type', 'quantity', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = StockMovement::query()->with(['product', 'warehouse', 'fromWarehouse', 'toWarehouse', 'user', 'branch']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhereHas('product', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (! empty($filters['branch_id'])) {
            $query->where('branch_id', $filters['branch_id']);
        }

        if (! empty($filters['warehouse_id'])) {
            $warehouseId = $filters['warehouse_id'];
            $query->where(function ($q) use ($warehouseId) {
                $q->where('warehouse_id', $warehouseId)
                    ->orWhere('from_warehouse_id', $warehouseId)
                    ->orWhere('to_warehouse_id', $warehouseId);
            });
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

    public function find(int $id): ?StockMovement
    {
        return StockMovement::with(['product', 'warehouse', 'fromWarehouse', 'toWarehouse', 'user', 'branch'])->find($id);
    }

    public function countForToday(): int
    {
        return StockMovement::whereDate('created_at', now())->count();
    }

    public function create(array $data): StockMovement
    {
        $movement = StockMovement::create($data);

        return $movement->fresh(['product', 'warehouse', 'fromWarehouse', 'toWarehouse', 'user', 'branch']);
    }

    public function movementReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $base = fn () => StockMovement::whereBetween('stock_movements.created_at', [$from, $to]);

        $byType = $base()
            ->selectRaw('type, COUNT(*) as count, SUM(quantity) as total_quantity')
            ->groupBy('type')
            ->get();

        $topProducts = $base()
            ->join('products', 'products.id', '=', 'stock_movements.product_id')
            ->selectRaw('products.id as product_id, products.name as product_name,
                COUNT(*) as movement_count,
                SUM(ABS(stock_movements.quantity)) as total_quantity')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_quantity')
            ->limit(10)
            ->get();

        $netChange = (int) $base()->where('type', '!=', 'transfer')->sum('quantity');

        return [
            'by_type' => $byType->map(fn ($r) => [
                'type' => $r->type,
                'count' => (int) $r->count,
                'total_quantity' => (int) $r->total_quantity,
            ])->values(),
            'top_products' => $topProducts->map(fn ($r) => [
                'product_id' => (int) $r->product_id,
                'product_name' => $r->product_name,
                'movement_count' => (int) $r->movement_count,
                'total_quantity' => (int) $r->total_quantity,
            ])->values(),
            'net_change' => $netChange,
        ];
    }
}
