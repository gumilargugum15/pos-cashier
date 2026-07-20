<?php

namespace App\Services;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function __construct(
        private readonly PermissionRepositoryInterface $permissions,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->permissions->paginate($filters);
    }

    public function find(int $id): ?Permission
    {
        return $this->permissions->find($id);
    }

    public function create(array $data): Permission
    {
        return $this->permissions->create($data);
    }

    public function update(Permission $permission, array $data): Permission
    {
        return $this->permissions->update($permission, $data);
    }

    public function delete(Permission $permission): void
    {
        if ($permission->roles()->count() > 0) {
            throw ValidationException::withMessages([
                'permission' => ['Permission masih digunakan oleh salah satu role, tidak bisa dihapus.'],
            ]);
        }

        $this->permissions->delete($permission);
    }
}
