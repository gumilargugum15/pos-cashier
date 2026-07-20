<?php

namespace App\Repositories\Contracts;

use App\Models\Sale;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface SaleRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Sale;

    public function countForToday(): int;

    public function create(array $saleData, array $items): Sale;

    public function save(Sale $sale): Sale;

    public function totalForDate(\DateTimeInterface $date): float;

    public function profitForDate(\DateTimeInterface $date): float;

    public function countForDate(\DateTimeInterface $date): int;

    public function cashTotalForDate(\DateTimeInterface $date): float;

    public function cashTotalForRange(\DateTimeInterface $from, \DateTimeInterface $to): float;

    public function pendingCount(): int;

    public function salesTrend(int $days): Collection;

    public function paymentMethodBreakdown(\DateTimeInterface $date): Collection;

    public function salesByCategory(\DateTimeInterface $since): Collection;

    public function latestTransactions(int $limit): Collection;

    public function salesReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array;

    public function profitReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array;

    public function taxCollected(\DateTimeInterface $from, \DateTimeInterface $to): float;

    public function customerReportRows(\DateTimeInterface $from, \DateTimeInterface $to): Collection;

    public function bestSellingReport(\DateTimeInterface $from, \DateTimeInterface $to, int $limit): Collection;
}
