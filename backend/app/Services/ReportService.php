<?php

namespace App\Services;

use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use App\Repositories\Contracts\SaleRepositoryInterface;
use App\Repositories\Contracts\StockMovementRepositoryInterface;

class ReportService
{
    public function __construct(
        private readonly SaleRepositoryInterface $sales,
        private readonly PurchaseRepositoryInterface $purchases,
        private readonly ProductRepositoryInterface $products,
        private readonly StockMovementRepositoryInterface $stockMovements,
    ) {
    }

    public function sales(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->sales->salesReportSummary($from, $to);
    }

    public function purchases(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->purchases->purchasesReportSummary($from, $to);
    }

    public function inventory(): array
    {
        return $this->products->inventoryReportSummary();
    }

    public function profit(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->sales->profitReportSummary($from, $to);
    }

    public function tax(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $collected = $this->sales->taxCollected($from, $to);
        $paid = $this->purchases->taxPaid($from, $to);

        return [
            'tax_collected' => $collected,
            'tax_paid' => $paid,
            'net_tax' => round($collected - $paid, 2),
        ];
    }

    public function customers(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return [
            'rows' => $this->sales->customerReportRows($from, $to),
        ];
    }

    public function suppliers(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return [
            'rows' => $this->purchases->supplierReportRows($from, $to),
        ];
    }

    public function bestSelling(\DateTimeInterface $from, \DateTimeInterface $to, int $limit = 10): array
    {
        return [
            'rows' => $this->sales->bestSellingReport($from, $to, $limit),
        ];
    }

    public function stockMovements(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        return $this->stockMovements->movementReportSummary($from, $to);
    }
}
