<?php

namespace App\Services;

use App\Models\Customer;
use App\Repositories\Contracts\CustomerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CustomerService
{
    public function __construct(
        private readonly CustomerRepositoryInterface $customers,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->customers->paginate($filters);
    }

    public function find(int $id): ?Customer
    {
        return $this->customers->find($id);
    }

    public function create(array $data): Customer
    {
        return $this->customers->create($data);
    }

    public function update(Customer $customer, array $data): Customer
    {
        return $this->customers->update($customer, $data);
    }

    public function delete(Customer $customer): void
    {
        $this->customers->delete($customer);
    }
}
