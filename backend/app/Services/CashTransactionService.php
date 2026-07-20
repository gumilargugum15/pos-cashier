<?php

namespace App\Services;

use App\Models\CashTransaction;
use App\Models\User;
use App\Repositories\Contracts\CashTransactionRepositoryInterface;
use App\Repositories\Contracts\ShiftRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class CashTransactionService
{
    private const CATEGORIES_IN = ['income', 'deposit', 'other'];

    private const CATEGORIES_OUT = ['expense', 'withdrawal', 'other'];

    public function __construct(
        private readonly CashTransactionRepositoryInterface $cashTransactions,
        private readonly ShiftRepositoryInterface $shifts,
    ) {
    }

    public function paginate(array $filters, User $actingUser): LengthAwarePaginator
    {
        if (! $actingUser->can('manage-finance')) {
            $filters['user_id'] = $actingUser->id;
        }

        return $this->cashTransactions->paginate($filters);
    }

    public function record(array $data, User $actingUser): CashTransaction
    {
        $shift = $this->shifts->findOpenForUser($actingUser->id);

        if (! $shift) {
            throw ValidationException::withMessages([
                'shift_id' => ['Anda belum membuka shift. Buka shift terlebih dahulu.'],
            ]);
        }

        $type = $data['type'];
        $category = $data['category'];
        $allowedCategories = $type === 'in' ? self::CATEGORIES_IN : self::CATEGORIES_OUT;

        if (! in_array($category, $allowedCategories, true)) {
            throw ValidationException::withMessages([
                'category' => ['Kategori tidak sesuai dengan tipe transaksi.'],
            ]);
        }

        return $this->cashTransactions->create([
            'reference_number' => $this->generateReferenceNumber(),
            'shift_id' => $shift->id,
            'type' => $type,
            'category' => $category,
            'amount' => round((float) $data['amount'], 2),
            'description' => $data['description'],
            'user_id' => $actingUser->id,
        ]);
    }

    private function generateReferenceNumber(): string
    {
        $sequence = $this->cashTransactions->countForToday() + 1;

        return 'FIN-'.now()->format('ymd').'-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
