<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->categoryService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Category $category) => new CategoryResource($category));

        return $this->paginated($paginator);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return $this->success(new CategoryResource($category), 'Kategori berhasil dibuat', 201);
    }

    public function show(Category $category): JsonResponse
    {
        return $this->success(new CategoryResource($category));
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category = $this->categoryService->update($category, $request->validated());

        return $this->success(new CategoryResource($category), 'Kategori berhasil diperbarui');
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return $this->success(null, 'Kategori berhasil dihapus');
    }
}
