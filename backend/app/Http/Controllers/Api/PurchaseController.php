<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RecordPurchasePaymentRequest;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Http\Resources\PurchaseResource;
use App\Models\Purchase;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PurchaseController extends Controller
{
    public function __construct(
        private readonly PurchaseService $purchaseService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'status', 'payment_status', 'supplier_id', 'sort', 'direction', 'per_page',
        ]);
        $filters['branch_id'] = $this->resolveBranchId($request);

        $paginator = $this->purchaseService->paginate($filters)
            ->through(fn (Purchase $purchase) => new PurchaseResource($purchase));

        return $this->paginated($paginator);
    }

    public function store(StorePurchaseRequest $request): JsonResponse
    {
        $purchase = $this->purchaseService->create(
            $request->validated(),
            $request->user()->id,
            $this->resolveBranchId($request),
        );

        return $this->success(new PurchaseResource($purchase), 'Pembelian berhasil dibuat', 201);
    }

    public function show(Purchase $purchase): JsonResponse
    {
        return $this->success(new PurchaseResource($purchase->load(['supplier', 'creator', 'items', 'branch'])));
    }

    public function update(UpdatePurchaseRequest $request, Purchase $purchase): JsonResponse
    {
        $purchase = $this->purchaseService->update($purchase, $request->validated());

        return $this->success(new PurchaseResource($purchase), 'Pembelian berhasil diperbarui');
    }

    public function destroy(Purchase $purchase): JsonResponse
    {
        $this->purchaseService->delete($purchase);

        return $this->success(null, 'Pembelian berhasil dihapus');
    }

    public function receive(Purchase $purchase): JsonResponse
    {
        $purchase = $this->purchaseService->receive($purchase);

        return $this->success(new PurchaseResource($purchase), 'Pembelian berhasil diterima');
    }

    public function cancel(Purchase $purchase): JsonResponse
    {
        $purchase = $this->purchaseService->cancel($purchase);

        return $this->success(new PurchaseResource($purchase), 'Pembelian berhasil dibatalkan');
    }

    public function pay(RecordPurchasePaymentRequest $request, Purchase $purchase): JsonResponse
    {
        $purchase = $this->purchaseService->recordPayment($purchase, (float) $request->validated('amount'));

        return $this->success(new PurchaseResource($purchase), 'Pembayaran berhasil dicatat');
    }
}
