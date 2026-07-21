<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class Controller
{
    /**
     * Resolve which branch a request should be scoped to.
     *
     * Users with a home branch are always locked to it (their own input is ignored,
     * so they can't spoof another branch). Users without a home branch (e.g. Admin/Owner)
     * may optionally pass a `branch_id` to scope a listing or tag a transaction.
     */
    protected function resolveBranchId(Request $request): ?int
    {
        $homeBranchId = $request->user()?->branch_id;

        if ($homeBranchId) {
            return (int) $homeBranchId;
        }

        return $request->filled('branch_id') ? (int) $request->input('branch_id') : null;
    }

    protected function success(mixed $data = null, string $message = 'Berhasil', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * @param  LengthAwarePaginator  $paginator  Items should already be mapped to their
     *                                           resource shape, e.g. via ->through(fn ($m) => new XResource($m))
     */
    protected function paginated(LengthAwarePaginator $paginator, string $message = 'Berhasil'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 200);
    }
}
