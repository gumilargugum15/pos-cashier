<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->productService->paginate($request->only([
            'search', 'category_id', 'brand_id', 'is_active', 'low_stock', 'sort', 'direction', 'per_page',
        ]))->through(fn (Product $product) => new ProductResource($product));

        return $this->paginated($paginator);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->validated(), $request->file('image'));

        return $this->success(new ProductResource($product), 'Produk berhasil dibuat', 201);
    }

    public function show(Product $product): JsonResponse
    {
        return $this->success(new ProductResource($product->load(['category', 'brand', 'unit'])));
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->productService->update($product, $request->validated(), $request->file('image'));

        return $this->success(new ProductResource($product), 'Produk berhasil diperbarui');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return $this->success(null, 'Produk berhasil dihapus');
    }
}
