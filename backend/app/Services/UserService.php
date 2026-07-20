<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->users->paginate($filters);
    }

    public function find(int $id): ?User
    {
        return $this->users->findById($id);
    }

    public function create(array $data): User
    {
        $data['password'] = Hash::make($data['password']);

        return $this->users->create($data);
    }

    public function update(User $user, array $data): User
    {
        $roles = $data['roles'] ?? null;
        unset($data['roles']);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user = $this->users->update($user, $data);

        if ($roles !== null) {
            $user->syncRoles($roles);
        }

        return $user->load('roles');
    }

    public function delete(User $user): void
    {
        $this->users->delete($user);
    }
}
