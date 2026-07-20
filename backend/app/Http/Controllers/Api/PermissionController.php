<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePermissionRequest;
use App\Http\Requests\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function __construct(
        private readonly PermissionService $permissionService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->permissionService->paginate($request->only([
            'search', 'sort', 'direction', 'per_page',
        ]))->through(fn (Permission $permission) => new PermissionResource($permission));

        return $this->paginated($paginator);
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = $this->permissionService->create($request->validated());

        return $this->success(new PermissionResource($permission), 'Permission berhasil dibuat', 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        return $this->success(new PermissionResource($permission));
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        $permission = $this->permissionService->update($permission, $request->validated());

        return $this->success(new PermissionResource($permission), 'Permission berhasil diperbarui');
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $this->permissionService->delete($permission);

        return $this->success(null, 'Permission berhasil dihapus');
    }
}
