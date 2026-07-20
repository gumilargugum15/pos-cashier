<?php

namespace App\Services;

use App\Models\Warehouse;
use App\Repositories\Contracts\WarehouseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class WarehouseService
{
    public function __construct(
        private readonly WarehouseRepositoryInterface $warehouses,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->warehouses->paginate($filters);
    }

    public function find(int $id): ?Warehouse
    {
        return $this->warehouses->find($id);
    }

    public function create(array $data): Warehouse
    {
        return $this->warehouses->create($data);
    }

    public function update(Warehouse $warehouse, array $data): Warehouse
    {
        return $this->warehouses->update($warehouse, $data);
    }

    public function delete(Warehouse $warehouse): void
    {
        $this->warehouses->delete($warehouse);
    }
}
