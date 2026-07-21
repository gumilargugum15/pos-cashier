<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCashTransactionRequest;
use App\Http\Resources\CashTransactionResource;
use App\Models\CashTransaction;
use App\Services\CashTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashTransactionController extends Controller
{
    public function __construct(
        private readonly CashTransactionService $cashTransactionService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'shift_id', 'type', 'category', 'sort', 'direction', 'per_page', 'date_from', 'date_to']);
        $filters['branch_id'] = $this->resolveBranchId($request);

        $paginator = $this->cashTransactionService->paginate($filters, $request->user())
            ->through(fn (CashTransaction $transaction) => new CashTransactionResource($transaction));

        return $this->paginated($paginator);
    }

    public function store(StoreCashTransactionRequest $request): JsonResponse
    {
        $transaction = $this->cashTransactionService->record(
            $request->validated(),
            $request->user(),
            $this->resolveBranchId($request),
        );

        return $this->success(
            new CashTransactionResource($transaction),
            'Transaksi kas berhasil dicatat',
            201,
        );
    }
}
