<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class RoleService
{
    public function __construct(
        private readonly RoleRepositoryInterface $roles,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->roles->paginate($filters);
    }

    public function find(int $id): ?Role
    {
        return $this->roles->find($id);
    }

    public function create(array $data): Role
    {
        return $this->roles->create($data);
    }

    public function update(Role $role, array $data): Role
    {
        return $this->roles->update($role, $data);
    }

    public function delete(Role $role): void
    {
        if ($role->users()->count() > 0) {
            throw ValidationException::withMessages([
                'role' => ['Role masih digunakan oleh salah satu user, tidak bisa dihapus.'],
            ]);
        }

        $this->roles->delete($role);
    }
}
