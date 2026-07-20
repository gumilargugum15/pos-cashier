<?php

namespace App\Services;

use App\Models\Branch;
use App\Repositories\Contracts\BranchRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class BranchService
{
    public function __construct(
        private readonly BranchRepositoryInterface $branches,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->branches->paginate($filters);
    }

    public function find(int $id): ?Branch
    {
        return $this->branches->find($id);
    }

    public function create(array $data): Branch
    {
        return $this->branches->create($data);
    }

    public function update(Branch $branch, array $data): Branch
    {
        return $this->branches->update($branch, $data);
    }

    public function delete(Branch $branch): void
    {
        $this->branches->delete($branch);
    }
}
