<?php

namespace Database\Factories;

use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Purchase>
 */
class PurchaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'purchase_number' => 'PO-'.fake()->unique()->numerify('######'),
            'supplier_id' => Supplier::factory(),
            'user_id' => User::factory(),
            'status' => 'ordered',
            'subtotal' => 0,
            'discount_percentage' => 0,
            'discount_amount' => 0,
            'tax_percentage' => 11,
            'tax_amount' => 0,
            'grand_total' => 0,
            'paid_amount' => 0,
            'payment_status' => 'unpaid',
            'notes' => null,
            'received_at' => null,
        ];
    }
}
