<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Purchase;
use App\Repositories\Contracts\PurchaseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseService
{
    public function __construct(
        private readonly PurchaseRepositoryInterface $purchases,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->purchases->paginate($filters);
    }

    public function find(int $id): ?Purchase
    {
        return $this->purchases->find($id);
    }

    public function create(array $data, int $userId, ?int $branchId = null): Purchase
    {
        [$purchaseData, $items] = $this->buildPurchaseData($data);

        $purchaseData['purchase_number'] = $this->generatePurchaseNumber();
        $purchaseData['branch_id'] = $branchId;
        $purchaseData['supplier_id'] = $data['supplier_id'];
        $purchaseData['user_id'] = $userId;
        $purchaseData['status'] = 'ordered';
        $purchaseData['paid_amount'] = 0;
        $purchaseData['payment_status'] = 'unpaid';
        $purchaseData['notes'] = $data['notes'] ?? null;

        return $this->purchases->create($purchaseData, $items);
    }

    public function update(Purchase $purchase, array $data): Purchase
    {
        if ($purchase->status !== 'ordered') {
            throw ValidationException::withMessages([
                'status' => ['Hanya pembelian berstatus ordered yang dapat diubah.'],
            ]);
        }

        [$purchaseData, $items] = $this->buildPurchaseData($data);

        $purchaseData['supplier_id'] = $data['supplier_id'];
        $purchaseData['notes'] = $data['notes'] ?? null;
        $purchaseData['payment_status'] = $this->derivePaymentStatus(
            (float) $purchase->paid_amount,
            $purchaseData['grand_total'],
        );

        return $this->purchases->updateWithItems($purchase, $purchaseData, $items);
    }

    public function receive(Purchase $purchase): Purchase
    {
        if ($purchase->status !== 'ordered') {
            throw ValidationException::withMessages([
                'status' => ['Hanya pembelian berstatus ordered yang dapat diterima.'],
            ]);
        }

        return DB::transaction(function () use ($purchase) {
            $items = $purchase->items;
            $products = Product::whereIn('id', $items->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($items as $item) {
                /** @var Product|null $product */
                $product = $products->get($item->product_id);

                if ($product) {
                    $product->increment('stock', $item->qty);
                    $product->update(['cost_price' => $item->cost_price]);
                }
            }

            $purchase->status = 'received';
            $purchase->received_at = now();

            return $this->purchases->save($purchase);
        });
    }

    public function cancel(Purchase $purchase): Purchase
    {
        if ($purchase->status !== 'ordered') {
            throw ValidationException::withMessages([
                'status' => ['Hanya pembelian berstatus ordered yang dapat dibatalkan.'],
            ]);
        }

        $purchase->status = 'cancelled';

        return $this->purchases->save($purchase);
    }

    public function recordPayment(Purchase $purchase, float $amount): Purchase
    {
        if ($purchase->status === 'cancelled') {
            throw ValidationException::withMessages([
                'status' => ['Pembelian yang dibatalkan tidak dapat dibayar.'],
            ]);
        }

        $remaining = round((float) $purchase->grand_total - (float) $purchase->paid_amount, 2);

        if ($amount > $remaining) {
            throw ValidationException::withMessages([
                'amount' => ['Jumlah pembayaran melebihi sisa tagihan.'],
            ]);
        }

        $paidAmount = round((float) $purchase->paid_amount + $amount, 2);

        $purchase->paid_amount = $paidAmount;
        $purchase->payment_status = $this->derivePaymentStatus($paidAmount, (float) $purchase->grand_total);

        return $this->purchases->save($purchase);
    }

    public function delete(Purchase $purchase): void
    {
        if ($purchase->status === 'received') {
            throw ValidationException::withMessages([
                'status' => ['Pembelian yang sudah diterima tidak dapat dihapus.'],
            ]);
        }

        $this->purchases->delete($purchase);
    }

    /**
     * @return array{0: array<string, mixed>, 1: array<int, array<string, mixed>>}
     */
    private function buildPurchaseData(array $data): array
    {
        $productIds = collect($data['items'])->pluck('product_id');
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $subtotal = 0;
        $items = [];

        foreach ($data['items'] as $line) {
            /** @var Product|null $product */
            $product = $products->get($line['product_id']);

            if (! $product) {
                throw ValidationException::withMessages([
                    'items' => ["Produk dengan ID {$line['product_id']} tidak ditemukan."],
                ]);
            }

            $qty = (int) $line['qty'];
            $costPrice = (float) $line['cost_price'];
            $lineSubtotal = round($qty * $costPrice, 2);
            $subtotal += $lineSubtotal;

            $items[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'qty' => $qty,
                'cost_price' => $costPrice,
                'subtotal' => $lineSubtotal,
            ];
        }

        $discountPercentage = (float) ($data['discount_percentage'] ?? 0);
        $taxPercentage = (float) ($data['tax_percentage'] ?? 11);

        $discountAmount = round($subtotal * ($discountPercentage / 100), 2);
        $beforeTax = $subtotal - $discountAmount;
        $taxAmount = round($beforeTax * ($taxPercentage / 100), 2);
        $grandTotal = round($beforeTax + $taxAmount, 2);

        $purchaseData = [
            'subtotal' => round($subtotal, 2),
            'discount_percentage' => $discountPercentage,
            'discount_amount' => $discountAmount,
            'tax_percentage' => $taxPercentage,
            'tax_amount' => $taxAmount,
            'grand_total' => $grandTotal,
        ];

        return [$purchaseData, $items];
    }

    private function derivePaymentStatus(float $paidAmount, float $grandTotal): string
    {
        if ($paidAmount <= 0) {
            return 'unpaid';
        }

        return $paidAmount >= $grandTotal ? 'paid' : 'partial';
    }

    private function generatePurchaseNumber(): string
    {
        $sequence = $this->purchases->countForToday() + 1;

        return 'PO-'.now()->format('ymd').'-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
