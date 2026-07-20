<?php

namespace App\Repositories\Contracts;

use App\Models\Category;
use Illuminate\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Category;

    public function create(array $data): Category;

    public function update(Category $category, array $data): Category;

    public function delete(Category $category): void;
}
