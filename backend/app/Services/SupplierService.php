<?php

namespace App\Services;

use App\Models\Supplier;
use App\Repositories\Contracts\SupplierRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class SupplierService
{
    public function __construct(
        private readonly SupplierRepositoryInterface $suppliers,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->suppliers->paginate($filters);
    }

    public function find(int $id): ?Supplier
    {
        return $this->suppliers->find($id);
    }

    public function create(array $data): Supplier
    {
        return $this->suppliers->create($data);
    }

    public function update(Supplier $supplier, array $data): Supplier
    {
        return $this->suppliers->update($supplier, $data);
    }

    public function delete(Supplier $supplier): void
    {
        $this->suppliers->delete($supplier);
    }
}
