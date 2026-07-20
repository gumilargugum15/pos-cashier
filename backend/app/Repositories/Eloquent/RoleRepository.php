<?php

namespace App\Repositories\Eloquent;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class RoleRepository implements RoleRepositoryInterface
{
    private const SORTABLE = ['name', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Role::query()->with('permissions')->withCount('users');

        if (! empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Role
    {
        return Role::with('permissions')->withCount('users')->find($id);
    }

    public function create(array $data): Role
    {
        $role = Role::create(['name' => $data['name'], 'guard_name' => 'web']);

        if (! empty($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return $role->load('permissions')->loadCount('users');
    }

    public function update(Role $role, array $data): Role
    {
        if (array_key_exists('name', $data)) {
            $role->update(['name' => $data['name']]);
        }

        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions'] ?? []);
        }

        return $role->fresh()->load('permissions')->loadCount('users');
    }

    public function delete(Role $role): void
    {
        $role->delete();
    }
}
