<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Repositories\Contracts\StockMovementRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockMovementService
{
    public function __construct(
        private readonly StockMovementRepositoryInterface $movements,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->movements->paginate($filters);
    }

    public function find(int $id): ?StockMovement
    {
        return $this->movements->find($id);
    }

    public function record(array $data, int $userId, ?int $branchId = null): StockMovement
    {
        return DB::transaction(function () use ($data, $userId, $branchId) {
            /** @var Product $product */
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();

            $stockBefore = $product->stock;
            $type = $data['type'];

            [$quantity, $stockAfter] = match ($type) {
                'in' => [(int) $data['quantity'], $stockBefore + (int) $data['quantity']],
                'out' => $this->calculateStockOut($product, (int) $data['quantity']),
                'adjustment' => $this->calculateAdjustment($stockBefore, (int) $data['new_stock']),
                'transfer' => $this->calculateTransfer($data, (int) $data['quantity'], $stockBefore),
            };

            if ($type !== 'transfer') {
                $product->update(['stock' => $stockAfter]);
            }

            return $this->movements->create([
                'reference_number' => $this->generateReferenceNumber(),
                'branch_id' => $branchId,
                'product_id' => $product->id,
                'type' => $type,
                'quantity' => $quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'warehouse_id' => in_array($type, ['in', 'out', 'adjustment'], true)
                    ? ($data['warehouse_id'] ?? null)
                    : null,
                'from_warehouse_id' => $type === 'transfer' ? $data['from_warehouse_id'] : null,
                'to_warehouse_id' => $type === 'transfer' ? $data['to_warehouse_id'] : null,
                'reason' => $data['reason'] ?? null,
                'user_id' => $userId,
            ]);
        });
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function calculateStockOut(Product $product, int $quantity): array
    {
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Stok {$product->name} tidak mencukupi (tersisa {$product->stock})."],
            ]);
        }

        return [-$quantity, $product->stock - $quantity];
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function calculateAdjustment(int $stockBefore, int $newStock): array
    {
        if ($newStock < 0) {
            throw ValidationException::withMessages([
                'new_stock' => ['Stok aktual tidak boleh kurang dari 0.'],
            ]);
        }

        return [$newStock - $stockBefore, $newStock];
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function calculateTransfer(array $data, int $quantity, int $stockBefore): array
    {
        if ((int) $data['from_warehouse_id'] === (int) $data['to_warehouse_id']) {
            throw ValidationException::withMessages([
                'to_warehouse_id' => ['Gudang tujuan harus berbeda dari gudang asal.'],
            ]);
        }

        return [$quantity, $stockBefore];
    }

    private function generateReferenceNumber(): string
    {
        $sequence = $this->movements->countForToday() + 1;

        return 'INV-'.now()->format('ymd').'-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
