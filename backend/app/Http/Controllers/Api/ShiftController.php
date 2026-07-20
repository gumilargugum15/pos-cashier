<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CloseShiftRequest;
use App\Http\Requests\OpenShiftRequest;
use App\Http\Resources\ShiftResource;
use App\Models\Shift;
use App\Services\ShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function __construct(
        private readonly ShiftService $shiftService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->shiftService->paginate(
            $request->only(['user_id', 'status', 'sort', 'direction', 'per_page']),
            $request->user(),
        )->through(fn (Shift $shift) => new ShiftResource($shift));

        return $this->paginated($paginator);
    }

    public function store(OpenShiftRequest $request): JsonResponse
    {
        $shift = $this->shiftService->open(
            $request->user(),
            (float) $request->validated('opening_balance'),
            $request->validated('notes'),
        );

        return $this->success(new ShiftResource($shift->load('user')), 'Shift berhasil dibuka', 201);
    }

    public function current(Request $request): JsonResponse
    {
        $shift = $this->shiftService->current($request->user());

        if (! $shift) {
            return $this->success(['shift' => null, 'live' => null]);
        }

        return $this->success([
            'shift' => new ShiftResource($shift->load('user')),
            'live' => $this->shiftService->liveSummary($shift),
        ]);
    }

    public function show(Request $request, Shift $shift): JsonResponse
    {
        $shift = $this->shiftService->show($shift->load('user'), $request->user());

        return $this->success(new ShiftResource($shift));
    }

    public function close(CloseShiftRequest $request, Shift $shift): JsonResponse
    {
        $shift = $this->shiftService->close(
            $shift,
            $request->user(),
            (float) $request->validated('closing_balance'),
            $request->validated('notes'),
        );

        return $this->success(new ShiftResource($shift), 'Shift berhasil ditutup');
    }
}
