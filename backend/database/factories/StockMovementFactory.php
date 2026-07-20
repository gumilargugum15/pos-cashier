<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference_number' => 'INV-'.fake()->unique()->numerify('######'),
            'product_id' => Product::factory(),
            'type' => 'in',
            'quantity' => 10,
            'stock_before' => 0,
            'stock_after' => 10,
            'warehouse_id' => null,
            'from_warehouse_id' => null,
            'to_warehouse_id' => null,
            'reason' => null,
            'user_id' => User::factory(),
        ];
    }
}
