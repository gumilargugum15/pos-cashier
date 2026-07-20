<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWarehouseRequest;
use App\Http\Requests\UpdateWarehouseRequest;
use App\Http\Resources\WarehouseResource;
use App\Models\Warehouse;
use App\Services\WarehouseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function __construct(
        private readonly WarehouseService $warehouseService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->warehouseService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Warehouse $warehouse) => new WarehouseResource($warehouse));

        return $this->paginated($paginator);
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $warehouse = $this->warehouseService->create($request->validated());

        return $this->success(new WarehouseResource($warehouse), 'Gudang berhasil dibuat', 201);
    }

    public function show(Warehouse $warehouse): JsonResponse
    {
        return $this->success(new WarehouseResource($warehouse));
    }

    public function update(UpdateWarehouseRequest $request, Warehouse $warehouse): JsonResponse
    {
        $warehouse = $this->warehouseService->update($warehouse, $request->validated());

        return $this->success(new WarehouseResource($warehouse), 'Gudang berhasil diperbarui');
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $this->warehouseService->delete($warehouse);

        return $this->success(null, 'Gudang berhasil dihapus');
    }
}
