<?php

namespace Database\Factories;

use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SaleItem>
 */
class SaleItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'qty' => 1,
            'price' => 0,
            'cost_price' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'subtotal' => 0,
        ];
    }
}
