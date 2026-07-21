<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Contracts\SaleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleService
{
    public function __construct(
        private readonly SaleRepositoryInterface $sales,
        private readonly ProductRepositoryInterface $products,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->sales->paginate($filters);
    }

    public function find(int $id): ?Sale
    {
        return $this->sales->find($id);
    }

    public function checkout(array $data, int $cashierId, ?int $branchId = null): Sale
    {
        return DB::transaction(function () use ($data, $cashierId, $branchId) {
            $products = Product::whereIn('id', collect($data['items'])->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $discountTotal = 0;
            $taxTotal = 0;
            $itemsToCreate = [];

            foreach ($data['items'] as $line) {
                /** @var Product|null $product */
                $product = $products->get($line['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => ["Produk dengan ID {$line['product_id']} tidak ditemukan."],
                    ]);
                }

                if ($product->stock < $line['qty']) {
                    throw ValidationException::withMessages([
                        'items' => ["Stok {$product->name} tidak mencukupi (tersisa {$product->stock})."],
                    ]);
                }

                $price = (float) $product->price;
                $costPrice = (float) $product->cost_price;
                $qty = (int) $line['qty'];

                $lineGross = $price * $qty;
                $lineDiscount = round($lineGross * ((float) $product->discount_percentage / 100), 2);
                $lineBeforeTax = $lineGross - $lineDiscount;
                $lineTax = round($lineBeforeTax * ((float) $product->tax_percentage / 100), 2);
                $lineSubtotal = $lineBeforeTax + $lineTax;

                $subtotal += $lineGross;
                $discountTotal += $lineDiscount;
                $taxTotal += $lineTax;

                $itemsToCreate[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'qty' => $qty,
                    'price' => $price,
                    'cost_price' => $costPrice,
                    'discount_amount' => $lineDiscount,
                    'tax_amount' => $lineTax,
                    'subtotal' => $lineSubtotal,
                ];

                $product->decrement('stock', $qty);
            }

            $grandTotal = round($subtotal - $discountTotal + $taxTotal, 2);
            $paidAmount = (float) $data['paid_amount'];

            if ($paidAmount < $grandTotal) {
                throw ValidationException::withMessages([
                    'paid_amount' => ['Jumlah pembayaran kurang dari total belanja.'],
                ]);
            }

            $sale = $this->sales->create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'branch_id' => $branchId,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $cashierId,
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discountTotal, 2),
                'tax_amount' => round($taxTotal, 2),
                'grand_total' => $grandTotal,
                'paid_amount' => round($paidAmount, 2),
                'change_amount' => round($paidAmount - $grandTotal, 2),
                'payment_method' => $data['payment_method'],
                'status' => 'paid',
            ], $itemsToCreate);

            return $sale;
        });
    }

    public function refund(Sale $sale): Sale
    {
        if ($sale->status !== 'paid') {
            throw ValidationException::withMessages([
                'status' => ['Hanya transaksi berstatus paid yang dapat direfund.'],
            ]);
        }

        return DB::transaction(function () use ($sale) {
            $items = $sale->items;
            $products = Product::whereIn('id', $items->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($items as $item) {
                /** @var Product|null $product */
                $product = $products->get($item->product_id);

                if ($product) {
                    $product->increment('stock', $item->qty);
                }
            }

            $sale->status = 'refunded';

            return $this->sales->save($sale);
        });
    }

    private function generateInvoiceNumber(): string
    {
        $sequence = $this->sales->countForToday() + 1;

        return 'TX-'.now()->format('ymd').'-'.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
