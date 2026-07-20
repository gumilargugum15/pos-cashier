<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    public function __construct(
        private readonly RoleService $roleService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->roleService->paginate($request->only([
            'search', 'sort', 'direction', 'per_page',
        ]))->through(fn (Role $role) => new RoleResource($role));

        return $this->paginated($paginator);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return $this->success(new RoleResource($role), 'Role berhasil dibuat', 201);
    }

    public function show(Role $role): JsonResponse
    {
        return $this->success(new RoleResource($role->load('permissions')->loadCount('users')));
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role = $this->roleService->update($role, $request->validated());

        return $this->success(new RoleResource($role), 'Role berhasil diperbarui');
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete($role);

        return $this->success(null, 'Role berhasil dihapus');
    }
}
