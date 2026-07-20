<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;

interface PermissionRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Permission;

    public function create(array $data): Permission;

    public function update(Permission $permission, array $data): Permission;

    public function delete(Permission $permission): void;
}
