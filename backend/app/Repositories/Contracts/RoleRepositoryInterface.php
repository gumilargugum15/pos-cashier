<?php

namespace App\Repositories\Contracts;

use App\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;

interface RoleRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Role;

    public function create(array $data): Role;

    public function update(Role $role, array $data): Role;

    public function delete(Role $role): void;
}
