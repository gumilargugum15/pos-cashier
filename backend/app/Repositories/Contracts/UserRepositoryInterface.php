<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    public function update(User $user, array $data): User;

    public function paginate(array $filters): LengthAwarePaginator;

    public function create(array $data): User;

    public function delete(User $user): void;
}
