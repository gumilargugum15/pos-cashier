<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class Controller
{
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
