<?php

namespace App\Repositories\Contracts;

use App\Models\Customer;
use Illuminate\Pagination\LengthAwarePaginator;

interface CustomerRepositoryInterface
{
    public function count(): int;

    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Customer;

    public function create(array $data): Customer;

    public function update(Customer $customer, array $data): Customer;

    public function delete(Customer $customer): void;
}
