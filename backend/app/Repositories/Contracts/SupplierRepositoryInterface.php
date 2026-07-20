<?php

namespace App\Repositories\Contracts;

use App\Models\Supplier;
use Illuminate\Pagination\LengthAwarePaginator;

interface SupplierRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Supplier;

    public function create(array $data): Supplier;

    public function update(Supplier $supplier, array $data): Supplier;

    public function delete(Supplier $supplier): void;
}
