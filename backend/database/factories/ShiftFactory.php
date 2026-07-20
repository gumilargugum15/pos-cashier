<?php

namespace Database\Factories;

use App\Models\Shift;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shift>
 */
class ShiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'opening_balance' => 100000,
            'closing_balance' => null,
            'expected_balance' => null,
            'variance' => null,
            'status' => 'open',
            'notes' => null,
            'opened_at' => now(),
            'closed_at' => null,
        ];
    }
}
