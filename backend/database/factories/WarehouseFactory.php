<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Gudang '.fake()->unique()->city(),
            'code' => strtoupper(fake()->unique()->bothify('WH-###')),
            'phone' => fake()->numerify('021-#######'),
            'address' => fake()->address(),
            'is_active' => true,
        ];
    }
}
