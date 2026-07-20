<?php

namespace App\Repositories\Eloquent;

use App\Models\Shift;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ShiftRepository implements ShiftRepositoryInterface
{
    private const SORTABLE = ['opened_at', 'closed_at', 'status', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Shift::query()->with(['user']);

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'opened_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Shift
    {
        return Shift::with(['user'])->find($id);
    }

    public function findOpenForUser(int $userId): ?Shift
    {
        return Shift::where('user_id', $userId)->where('status', 'open')->first();
    }

    public function create(array $data): Shift
    {
        $shift = Shift::create($data);

        return $shift->fresh(['user']);
    }

    public function save(Shift $shift): Shift
    {
        $shift->save();

        return $shift->fresh(['user']);
    }
}
