<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use App\Services\UnitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function __construct(
        private readonly UnitService $unitService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->unitService->paginate($request->only([
            'search', 'sort', 'direction', 'per_page',
        ]))->through(fn (Unit $unit) => new UnitResource($unit));

        return $this->paginated($paginator);
    }

    public function store(StoreUnitRequest $request): JsonResponse
    {
        $unit = $this->unitService->create($request->validated());

        return $this->success(new UnitResource($unit), 'Unit berhasil dibuat', 201);
    }

    public function show(Unit $unit): JsonResponse
    {
        return $this->success(new UnitResource($unit));
    }

    public function update(UpdateUnitRequest $request, Unit $unit): JsonResponse
    {
        $unit = $this->unitService->update($unit, $request->validated());

        return $this->success(new UnitResource($unit), 'Unit berhasil diperbarui');
    }

    public function destroy(Unit $unit): JsonResponse
    {
        $this->unitService->delete($unit);

        return $this->success(null, 'Unit berhasil dihapus');
    }
}
