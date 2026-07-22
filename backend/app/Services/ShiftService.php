<?php

namespace App\Services;

use App\Models\Shift;
use App\Models\User;
use App\Repositories\Contracts\CashTransactionRepositoryInterface;
use App\Repositories\Contracts\SaleRepositoryInterface;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class ShiftService
{
    public function __construct(
        private readonly ShiftRepositoryInterface $shifts,
        private readonly SaleRepositoryInterface $sales,
        private readonly CashTransactionRepositoryInterface $cashTransactions,
    ) {
    }

    public function paginate(array $filters, User $actingUser): LengthAwarePaginator
    {
        if (! $actingUser->can('manage-finance')) {
            $filters['user_id'] = $actingUser->id;
        }

        return $this->shifts->paginate($filters);
    }

    public function show(Shift $shift, User $actingUser): Shift
    {
        $this->assertAccess($shift, $actingUser);

        return $shift;
    }

    public function current(User $actingUser): ?Shift
    {
        return $this->shifts->findOpenForUser($actingUser->id);
    }

    public function open(User $actingUser, float $openingBalance, ?string $notes, ?int $branchId = null): Shift
    {
        if ($this->shifts->findOpenForUser($actingUser->id)) {
            throw ValidationException::withMessages([
                'user_id' => ['Anda sudah memiliki shift yang sedang berjalan.'],
            ]);
        }

        return $this->shifts->create([
            'user_id' => $actingUser->id,
            'branch_id' => $branchId,
            'opening_balance' => $openingBalance,
            'status' => 'open',
            'notes' => $notes,
            'opened_at' => now(),
        ]);
    }

    public function close(Shift $shift, User $actingUser, float $closingBalance, ?string $notes): Shift
    {
        $this->assertAccess($shift, $actingUser);

        if ($shift->status !== 'open') {
            throw ValidationException::withMessages([
                'status' => ['Shift ini sudah ditutup.'],
            ]);
        }

        $summary = $this->liveSummary($shift);

        $shift->closing_balance = round($closingBalance, 2);
        $shift->expected_balance = $summary['expected_balance'];
        $shift->variance = round($closingBalance - $summary['expected_balance'], 2);
        $shift->status = 'closed';
        $shift->closed_at = now();

        if ($notes !== null) {
            $shift->notes = $notes;
        }

        return $this->shifts->save($shift);
    }

    public function liveSummary(Shift $shift): array
    {
        $cashSales = $this->sales->cashTotalForRange($shift->opened_at, now());
        $totals = $this->cashTransactions->totalsForShift($shift->id);

        return [
            'cash_sales' => $cashSales,
            'cash_in_total' => $totals['total_in'],
            'cash_out_total' => $totals['total_out'],
            'expected_balance' => round(
                (float) $shift->opening_balance + $cashSales + $totals['total_in'] - $totals['total_out'],
                2,
            ),
        ];
    }

    private function assertAccess(Shift $shift, User $actingUser): void
    {
        if (! $actingUser->can('manage-finance') && $shift->user_id !== $actingUser->id) {
            abort(403, 'Anda tidak memiliki akses ke shift ini.');
        }
    }
}
