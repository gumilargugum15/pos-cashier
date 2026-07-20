<?php

namespace Database\Factories;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_number' => 'TX-'.fake()->unique()->numerify('######'),
            'customer_id' => null,
            'user_id' => User::factory(),
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'grand_total' => 0,
            'paid_amount' => 0,
            'change_amount' => 0,
            'payment_method' => fake()->randomElement(['cash', 'debit', 'credit_card', 'transfer', 'qris', 'e_wallet']),
            'status' => 'paid',
        ];
    }
}
