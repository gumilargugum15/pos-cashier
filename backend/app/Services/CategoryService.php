<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class CategoryService
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categories,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->categories->paginate($filters);
    }

    public function find(int $id): ?Category
    {
        return $this->categories->find($id);
    }

    public function create(array $data): Category
    {
        $data['slug'] = $this->resolveSlug($data['slug'] ?? null, $data['name']);

        return $this->categories->create($data);
    }

    public function update(Category $category, array $data): Category
    {
        if (array_key_exists('name', $data) && empty($data['slug'])) {
            $data['slug'] = $this->resolveSlug(null, $data['name']);
        }

        return $this->categories->update($category, $data);
    }

    public function delete(Category $category): void
    {
        $this->categories->delete($category);
    }

    private function resolveSlug(?string $slug, string $name): string
    {
        return $slug ? Str::slug($slug) : Str::slug($name);
    }
}
