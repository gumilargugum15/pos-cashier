<?php

namespace App\Repositories\Eloquent;

use App\Models\Brand;
use App\Repositories\Contracts\BrandRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BrandRepository implements BrandRepositoryInterface
{
    private const SORTABLE = ['name', 'is_active', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Brand::query();

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
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

    public function find(int $id): ?Brand
    {
        return Brand::find($id);
    }

    public function create(array $data): Brand
    {
        return Brand::create($data)->fresh();
    }

    public function update(Brand $brand, array $data): Brand
    {
        $brand->update($data);

        return $brand->fresh();
    }

    public function delete(Brand $brand): void
    {
        $brand->delete();
    }
}
