<?php

namespace Database\Factories;

use App\Models\CashTransaction;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashTransaction>
 */
class CashTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference_number' => 'FIN-'.fake()->unique()->numerify('######'),
            'shift_id' => Shift::factory(),
            'type' => 'in',
            'category' => 'income',
            'amount' => 10000,
            'description' => fake()->sentence(),
            'user_id' => User::factory(),
        ];
    }
}
