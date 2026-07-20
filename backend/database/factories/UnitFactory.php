<?php

namespace Database\Factories;

use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        [$name, $symbol] = fake()->unique()->randomElement([
            ['Pieces', 'pcs'],
            ['Kilogram', 'kg'],
            ['Gram', 'g'],
            ['Liter', 'L'],
            ['Mililiter', 'mL'],
            ['Box', 'box'],
            ['Pack', 'pack'],
            ['Botol', 'btl'],
            ['Lusin', 'lsn'],
        ]);

        return [
            'name' => $name,
            'symbol' => $symbol,
        ];
    }
}
