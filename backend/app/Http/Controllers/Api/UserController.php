<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->userService->paginate($request->only([
            'search', 'is_active', 'role', 'branch_id', 'sort', 'direction', 'per_page',
        ]))->through(fn (User $user) => new UserResource($user));

        return $this->paginated($paginator);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return $this->success(new UserResource($user), 'User berhasil dibuat', 201);
    }

    public function show(User $user): JsonResponse
    {
        return $this->success(new UserResource($user->load(['roles', 'branch'])));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user = $this->userService->update($user, $request->validated());

        return $this->success(new UserResource($user), 'User berhasil diperbarui');
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            throw ValidationException::withMessages([
                'user' => ['Anda tidak bisa menghapus akun Anda sendiri.'],
            ]);
        }

        $this->userService->delete($user);

        return $this->success(null, 'User berhasil dihapus');
    }
}
