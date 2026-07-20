<?php

namespace App\Repositories\Eloquent;

use App\Models\Unit;
use App\Repositories\Contracts\UnitRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UnitRepository implements UnitRepositoryInterface
{
    private const SORTABLE = ['name', 'symbol', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Unit::query();

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('symbol', 'like', "%{$search}%");
            });
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Unit
    {
        return Unit::find($id);
    }

    public function create(array $data): Unit
    {
        return Unit::create($data)->fresh();
    }

    public function update(Unit $unit, array $data): Unit
    {
        $unit->update($data);

        return $unit->fresh();
    }

    public function delete(Unit $unit): void
    {
        $unit->delete();
    }
}
