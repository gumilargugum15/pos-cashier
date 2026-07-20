<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cost = fake()->randomFloat(2, 5000, 150000);
        $price = $cost * fake()->randomFloat(2, 1.15, 1.6);
        $stock = fake()->numberBetween(0, 150);

        return [
            'barcode' => fake()->unique()->ean13(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'name' => ucwords(fake()->unique()->words(3, true)),
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'unit_id' => Unit::factory(),
            'cost_price' => $cost,
            'price' => round($price, 2),
            'stock' => $stock,
            'min_stock' => fake()->numberBetween(5, 20),
            'tax_percentage' => 11,
            'discount_percentage' => fake()->randomElement([0, 0, 0, 5, 10]),
            'is_active' => true,
        ];
    }
}
