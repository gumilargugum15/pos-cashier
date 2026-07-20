<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class SaleSeeder extends Seeder
{
    private const PAYMENT_METHODS = ['cash', 'debit', 'credit_card', 'transfer', 'qris', 'e_wallet'];

    private const DAYS_BACK = 30;

    private const SALES_PER_DAY_MIN = 3;

    private const SALES_PER_DAY_MAX = 12;

    private int $sequence = 0;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();
        $customers = Customer::all();
        $cashiers = User::all();

        if ($products->isEmpty() || $cashiers->isEmpty()) {
            return;
        }

        for ($daysAgo = self::DAYS_BACK; $daysAgo >= 0; $daysAgo--) {
            $salesToday = rand(self::SALES_PER_DAY_MIN, self::SALES_PER_DAY_MAX);

            for ($i = 0; $i < $salesToday; $i++) {
                $this->createSale($products, $customers, $cashiers, $daysAgo);
            }
        }
    }

    private function createSale($products, $customers, $cashiers, int $daysAgo): void
    {
        $createdAt = Carbon::today()->subDays($daysAgo)
            ->setTime(rand(8, 21), rand(0, 59), rand(0, 59));

        $itemCount = rand(1, 5);
        $lines = $products->random(min($itemCount, $products->count()));

        $subtotal = 0;
        $taxTotal = 0;
        $discountTotal = 0;
        $itemsData = [];

        foreach ($lines as $product) {
            $qty = rand(1, 4);
            $price = (float) $product->price;
            $cost = (float) $product->cost_price;
            $lineDiscount = round($price * $qty * ((float) $product->discount_percentage / 100), 2);
            $lineSubtotalBeforeTax = ($price * $qty) - $lineDiscount;
            $lineTax = round($lineSubtotalBeforeTax * ((float) $product->tax_percentage / 100), 2);
            $lineSubtotal = $lineSubtotalBeforeTax + $lineTax;

            $subtotal += $price * $qty;
            $discountTotal += $lineDiscount;
            $taxTotal += $lineTax;

            $itemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'qty' => $qty,
                'price' => $price,
                'cost_price' => $cost,
                'discount_amount' => $lineDiscount,
                'tax_amount' => $lineTax,
                'subtotal' => $lineSubtotal,
            ];
        }

        $grandTotal = $subtotal - $discountTotal + $taxTotal;
        $status = fake()->randomElement(['paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'paid', 'refunded']);
        $paidAmount = $status === 'refunded' ? $grandTotal : $grandTotal + fake()->randomElement([0, 0, 0, 5000, 10000, 20000]);

        $this->sequence++;

        $sale = Sale::create([
            'invoice_number' => 'TX-'.$createdAt->format('ymd').'-'.str_pad((string) $this->sequence, 5, '0', STR_PAD_LEFT),
            'customer_id' => fake()->boolean(40) && $customers->isNotEmpty() ? $customers->random()->id : null,
            'user_id' => $cashiers->random()->id,
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discountTotal, 2),
            'tax_amount' => round($taxTotal, 2),
            'grand_total' => round($grandTotal, 2),
            'paid_amount' => round($paidAmount, 2),
            'change_amount' => round($paidAmount - $grandTotal, 2),
            'payment_method' => fake()->randomElement(self::PAYMENT_METHODS),
            'status' => $status,
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        foreach ($itemsData as $item) {
            SaleItem::create(array_merge($item, [
                'sale_id' => $sale->id,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]));
        }
    }
}
