<?php

namespace App\Services;

use App\Models\Brand;
use App\Repositories\Contracts\BrandRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BrandService
{
    public function __construct(
        private readonly BrandRepositoryInterface $brands,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->brands->paginate($filters);
    }

    public function find(int $id): ?Brand
    {
        return $this->brands->find($id);
    }

    public function create(array $data): Brand
    {
        return $this->brands->create($data);
    }

    public function update(Brand $brand, array $data): Brand
    {
        return $this->brands->update($brand, $data);
    }

    public function delete(Brand $brand): void
    {
        $this->brands->delete($brand);
    }
}
