<?php

namespace App\Repositories\Eloquent;

use App\Models\Branch;
use App\Repositories\Contracts\BranchRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BranchRepository implements BranchRepositoryInterface
{
    private const SORTABLE = ['name', 'code', 'is_active', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Branch::query();

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

    public function find(int $id): ?Branch
    {
        return Branch::find($id);
    }

    public function create(array $data): Branch
    {
        return Branch::create($data)->fresh();
    }

    public function update(Branch $branch, array $data): Branch
    {
        $branch->update($data);

        return $branch->fresh();
    }

    public function delete(Branch $branch): void
    {
        $branch->delete();
    }
}
