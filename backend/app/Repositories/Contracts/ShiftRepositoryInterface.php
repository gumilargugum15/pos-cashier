<?php

namespace App\Repositories\Contracts;

use App\Models\Shift;
use Illuminate\Pagination\LengthAwarePaginator;

interface ShiftRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Shift;

    public function findOpenForUser(int $userId): ?Shift;

    public function create(array $data): Shift;

    public function save(Shift $shift): Shift;
}
