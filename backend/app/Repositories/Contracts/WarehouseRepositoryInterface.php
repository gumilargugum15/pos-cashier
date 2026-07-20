<?php

namespace App\Repositories\Contracts;

use App\Models\Warehouse;
use Illuminate\Pagination\LengthAwarePaginator;

interface WarehouseRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Warehouse;

    public function create(array $data): Warehouse;

    public function update(Warehouse $warehouse, array $data): Warehouse;

    public function delete(Warehouse $warehouse): void;
}
