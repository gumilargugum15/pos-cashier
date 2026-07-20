<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(
        private readonly SaleService $saleService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->saleService->paginate($request->only([
            'search', 'status', 'payment_method', 'customer_id', 'sort', 'direction', 'per_page',
        ]))->through(fn (Sale $sale) => new SaleResource($sale));

        return $this->paginated($paginator);
    }

    public function store(StoreSaleRequest $request): JsonResponse
    {
        $sale = $this->saleService->checkout($request->validated(), $request->user()->id);

        return $this->success(new SaleResource($sale), 'Transaksi berhasil disimpan', 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        return $this->success(new SaleResource($sale->load(['customer', 'cashier', 'items'])));
    }

    public function refund(Sale $sale): JsonResponse
    {
        $sale = $this->saleService->refund($sale);

        return $this->success(new SaleResource($sale), 'Transaksi berhasil direfund');
    }
}
