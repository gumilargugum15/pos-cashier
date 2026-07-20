<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockMovementRequest;
use App\Http\Resources\StockMovementResource;
use App\Models\StockMovement;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function __construct(
        private readonly StockMovementService $stockMovementService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->stockMovementService->paginate($request->only([
            'search', 'type', 'product_id', 'warehouse_id', 'sort', 'direction', 'per_page',
        ]))->through(fn (StockMovement $movement) => new StockMovementResource($movement));

        return $this->paginated($paginator);
    }

    public function store(StoreStockMovementRequest $request): JsonResponse
    {
        $movement = $this->stockMovementService->record($request->validated(), $request->user()->id);

        return $this->success(new StockMovementResource($movement), 'Pergerakan stok berhasil dicatat', 201);
    }

    public function show(StockMovement $stockMovement): JsonResponse
    {
        return $this->success(new StockMovementResource(
            $stockMovement->load(['product', 'warehouse', 'fromWarehouse', 'toWarehouse', 'user']),
        ));
    }
}
