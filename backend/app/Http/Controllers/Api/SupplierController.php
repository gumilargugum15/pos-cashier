<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function __construct(
        private readonly SupplierService $supplierService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->supplierService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Supplier $supplier) => new SupplierResource($supplier));

        return $this->paginated($paginator);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $supplier = $this->supplierService->create($request->validated());

        return $this->success(new SupplierResource($supplier), 'Supplier berhasil dibuat', 201);
    }

    public function show(Supplier $supplier): JsonResponse
    {
        return $this->success(new SupplierResource($supplier));
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): JsonResponse
    {
        $supplier = $this->supplierService->update($supplier, $request->validated());

        return $this->success(new SupplierResource($supplier), 'Supplier berhasil diperbarui');
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $this->supplierService->delete($supplier);

        return $this->success(null, 'Supplier berhasil dihapus');
    }
}
