<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBrandRequest;
use App\Http\Requests\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function __construct(
        private readonly BrandService $brandService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->brandService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Brand $brand) => new BrandResource($brand));

        return $this->paginated($paginator);
    }

    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->create($request->validated());

        return $this->success(new BrandResource($brand), 'Brand berhasil dibuat', 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return $this->success(new BrandResource($brand));
    }

    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $brand = $this->brandService->update($brand, $request->validated());

        return $this->success(new BrandResource($brand), 'Brand berhasil diperbarui');
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $this->brandService->delete($brand);

        return $this->success(null, 'Brand berhasil dihapus');
    }
}
