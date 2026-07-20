<?php

namespace App\Repositories\Contracts;

use App\Models\StockMovement;
use Illuminate\Pagination\LengthAwarePaginator;

interface StockMovementRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?StockMovement;

    public function countForToday(): int;

    public function create(array $data): StockMovement;

    public function movementReportSummary(\DateTimeInterface $from, \DateTimeInterface $to): array;
}
