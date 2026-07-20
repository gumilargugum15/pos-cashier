<?php

namespace App\Repositories\Contracts;

use App\Models\CashTransaction;
use Illuminate\Pagination\LengthAwarePaginator;

interface CashTransactionRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?CashTransaction;

    public function countForToday(): int;

    public function create(array $data): CashTransaction;

    public function totalsForShift(int $shiftId): array;
}
