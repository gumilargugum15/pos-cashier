<?php

namespace App\Repositories\Contracts;

use App\Models\Unit;
use Illuminate\Pagination\LengthAwarePaginator;

interface UnitRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Unit;

    public function create(array $data): Unit;

    public function update(Unit $unit, array $data): Unit;

    public function delete(Unit $unit): void;
}
