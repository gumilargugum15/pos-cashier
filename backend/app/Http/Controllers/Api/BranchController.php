<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBranchRequest;
use App\Http\Requests\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Models\Branch;
use App\Services\BranchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function __construct(
        private readonly BranchService $branchService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->branchService->paginate($request->only([
            'search', 'is_active', 'sort', 'direction', 'per_page',
        ]))->through(fn (Branch $branch) => new BranchResource($branch));

        return $this->paginated($paginator);
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $branch = $this->branchService->create($request->validated());

        return $this->success(new BranchResource($branch), 'Cabang berhasil dibuat', 201);
    }

    public function show(Branch $branch): JsonResponse
    {
        return $this->success(new BranchResource($branch));
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch = $this->branchService->update($branch, $request->validated());

        return $this->success(new BranchResource($branch), 'Cabang berhasil diperbarui');
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $this->branchService->delete($branch);

        return $this->success(null, 'Cabang berhasil dihapus');
    }
}
