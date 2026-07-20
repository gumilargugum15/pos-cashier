<?php

namespace App\Repositories\Eloquent;

use App\Models\CashTransaction;
use App\Repositories\Contracts\CashTransactionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class CashTransactionRepository implements CashTransactionRepositoryInterface
{
    private const SORTABLE = ['reference_number', 'type', 'amount', 'created_at'];

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = CashTransaction::query()->with(['shift', 'user']);

        if (! empty($filters['search'])) {
            $query->where('reference_number', 'like', "%{$filters['search']}%");
        }

        if (! empty($filters['shift_id'])) {
            $query->where('shift_id', $filters['shift_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?CashTransaction
    {
        return CashTransaction::with(['shift', 'user'])->find($id);
    }

    public function countForToday(): int
    {
        return CashTransaction::whereDate('created_at', now())->count();
    }

    public function create(array $data): CashTransaction
    {
        $transaction = CashTransaction::create($data);

        return $transaction->fresh(['shift', 'user']);
    }

    public function totalsForShift(int $shiftId): array
    {
        $totals = CashTransaction::where('shift_id', $shiftId)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_in,
                COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_out
            ")
            ->first();

        return [
            'total_in' => (float) $totals->total_in,
            'total_out' => (float) $totals->total_out,
        ];
    }
}
