<?php

namespace Tests\Feature\Api;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/v1/dashboard');

        $response->assertStatus(401);
    }

    public function test_dashboard_aggregates_todays_sales_correctly(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'unit_id' => Unit::factory(),
            'stock' => 2,
            'min_stock' => 10,
        ]);

        $sale = Sale::factory()->create([
            'user_id' => $user->id,
            'payment_method' => 'cash',
            'status' => 'paid',
            'subtotal' => 100000,
            'tax_amount' => 11000,
            'discount_amount' => 0,
            'grand_total' => 111000,
            'paid_amount' => 111000,
            'created_at' => now(),
        ]);

        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'qty' => 2,
            'price' => 50000,
            'cost_price' => 30000,
            'subtotal' => 111000,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.stats.today_sales', 111000)
            ->assertJsonPath('data.stats.transactions_count', 1)
            ->assertJsonPath('data.stats.cash_in_drawer', 111000)
            ->assertJsonPath('data.stats.low_stock_count', 1)
            ->assertJsonPath('data.stats.products_count', 1);

        // profit = qty * (price - cost_price) = 2 * (50000 - 30000) = 40000
        $response->assertJsonPath('data.stats.today_profit', 40000);
    }

    public function test_dashboard_shows_zero_stats_when_no_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard');

        $response->assertOk()
            ->assertJsonPath('data.stats.today_sales', 0)
            ->assertJsonPath('data.stats.transactions_count', 0)
            ->assertJsonPath('data.stats.pending_orders_count', 0);
    }
}
