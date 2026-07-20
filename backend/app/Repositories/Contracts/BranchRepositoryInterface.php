<?php

namespace App\Repositories\Contracts;

use App\Models\Branch;
use Illuminate\Pagination\LengthAwarePaginator;

interface BranchRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Branch;

    public function create(array $data): Branch;

    public function update(Branch $branch, array $data): Branch;

    public function delete(Branch $branch): void;
}
