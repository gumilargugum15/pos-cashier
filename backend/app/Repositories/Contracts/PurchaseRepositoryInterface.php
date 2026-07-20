<?php

namespace App\Repositories\Contracts;

use App\Models\Purchase;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface PurchaseRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Purchase;

    public function countForToday(): int;

    public function create(array $purchaseData, array $items): Purchase;

    public function updateWithItems(Purchase $purchase, array $purchaseData, array $items): Purchase;

    public function save(Purchase $purchase): Purchase;

    public function delete(Purchase $purchase): void;

    public function purchasesReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array;

    public function taxPaid(\DateTimeInterface $from, \DateTimeInterface $to): float;

    public function supplierReportRows(\DateTimeInterface $from, \DateTimeInterface $to): Collection;
}
