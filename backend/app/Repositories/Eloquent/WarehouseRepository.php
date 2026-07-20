<?php

namespace App\Repositories\Eloquent;

use App\Models\Warehouse;
use App\Repositories\Contracts\WarehouseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class WarehouseRepository implements WarehouseRepositoryInterface
{
    private const SORTABLE = ['name', 'code', 'is_active', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Warehouse::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Warehouse
    {
        return Warehouse::find($id);
    }

    public function create(array $data): Warehouse
    {
        return Warehouse::create($data)->fresh();
    }

    public function update(Warehouse $warehouse, array $data): Warehouse
    {
        $warehouse->update($data);

        return $warehouse->fresh();
    }

    public function delete(Warehouse $warehouse): void
    {
        $warehouse->delete();
    }
}
