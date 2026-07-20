<?php

namespace App\Services;

use App\Models\Unit;
use App\Repositories\Contracts\UnitRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UnitService
{
    public function __construct(
        private readonly UnitRepositoryInterface $units,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->units->paginate($filters);
    }

    public function find(int $id): ?Unit
    {
        return $this->units->find($id);
    }

    public function create(array $data): Unit
    {
        return $this->units->create($data);
    }

    public function update(Unit $unit, array $data): Unit
    {
        return $this->units->update($unit, $data);
    }

    public function delete(Unit $unit): void
    {
        $this->units->delete($unit);
    }
}
