<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportDateRangeRequest;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reportService,
    ) {
    }

    public function sales(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->sales($request->from(), $request->to()));
    }

    public function purchases(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->purchases($request->from(), $request->to()));
    }

    public function inventory(): JsonResponse
    {
        return $this->success($this->reportService->inventory());
    }

    public function profit(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->profit($request->from(), $request->to()));
    }

    public function tax(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->tax($request->from(), $request->to()));
    }

    public function customers(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->customers($request->from(), $request->to()));
    }

    public function suppliers(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->suppliers($request->from(), $request->to()));
    }

    public function bestSelling(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->bestSelling($request->from(), $request->to()));
    }

    public function stockMovements(ReportDateRangeRequest $request): JsonResponse
    {
        return $this->success($this->reportService->stockMovements($request->from(), $request->to()));
    }
}
