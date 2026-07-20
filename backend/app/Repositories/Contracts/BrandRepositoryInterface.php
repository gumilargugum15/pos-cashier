<?php

namespace App\Repositories\Contracts;

use App\Models\Brand;
use Illuminate\Pagination\LengthAwarePaginator;

interface BrandRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Brand;

    public function create(array $data): Brand;

    public function update(Brand $brand, array $data): Brand;

    public function delete(Brand $brand): void;
}
