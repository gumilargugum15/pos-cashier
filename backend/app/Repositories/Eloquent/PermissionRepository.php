<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;

class PermissionRepository implements PermissionRepositoryInterface
{
    private const SORTABLE = ['name', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Permission::query();

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Permission
    {
        return Permission::find($id);
    }

    public function create(array $data): Permission
    {
        return Permission::create(['name' => $data['name'], 'guard_name' => 'web'])->fresh();
    }

    public function update(Permission $permission, array $data): Permission
    {
        $permission->update($data);

        return $permission->fresh();
    }

    public function delete(Permission $permission): void
    {
        $permission->delete();
    }
}
