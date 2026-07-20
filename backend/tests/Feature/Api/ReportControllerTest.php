<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('view-reports');
        $user = User::factory()->create();
        $user->givePermissionTo('view-reports');

        return $user;
    }

    public function test_guest_cannot_view_reports(): void
    {
        $this->getJson('/api/v1/reports/sales')->assertStatus(401);
        $this->getJson('/api/v1/reports/inventory')->assertStatus(401);
    }

    public function test_user_without_permission_cannot_view_reports(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/reports/sales')->assertStatus(403);
        $this->actingAs($user, 'sanctum')->getJson('/api/v1/reports/purchases')->assertStatus(403);
    }

    public function test_sales_report_summary_math(): void
    {
        $user = $this->userWithPermission();
        $today = now();

        Sale::factory()->create([
            'status' => 'paid',
            'payment_method' => 'cash',
            'grand_total' => 10000,
            'discount_amount' => 500,
            'tax_amount' => 1000,
            'created_at' => $today,
        ]);
        Sale::factory()->create([
            'status' => 'paid',
            'payment_method' => 'qris',
            'grand_total' => 20000,
            'discount_amount' => 0,
            'tax_amount' => 2000,
            'created_at' => $today,
        ]);
        Sale::factory()->create([
            'status' => 'refunded',
            'grand_total' => 5000,
            'created_at' => $today,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/sales?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()
            ->assertJsonPath('data.total', 30000)
            ->assertJsonPath('data.count', 2)
            ->assertJsonPath('data.discount_total', 500)
            ->assertJsonPath('data.tax_total', 3000)
            ->assertJsonPath('data.avg', 15000);

        $byStatus = collect($response->json('data.by_status'));
        $this->assertSame(1, $byStatus->firstWhere('status', 'refunded')['count']);
    }

    public function test_purchases_report_summary_math(): void
    {
        $user = $this->userWithPermission();
        $today = now();

        Purchase::factory()->create([
            'status' => 'received',
            'payment_status' => 'partial',
            'grand_total' => 50000,
            'paid_amount' => 20000,
            'created_at' => $today,
        ]);
        Purchase::factory()->create([
            'status' => 'cancelled',
            'grand_total' => 99999,
            'created_at' => $today,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/purchases?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()
            ->assertJsonPath('data.total', 50000)
            ->assertJsonPath('data.count', 1)
            ->assertJsonPath('data.paid_total', 20000)
            ->assertJsonPath('data.outstanding_total', 30000);
    }

    public function test_inventory_report_summary(): void
    {
        $user = $this->userWithPermission();

        Product::factory()->create(['is_active' => true, 'stock' => 10, 'cost_price' => 1000, 'min_stock' => 5]);
        Product::factory()->create(['is_active' => true, 'stock' => 2, 'cost_price' => 500, 'min_stock' => 5]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/reports/inventory');

        $response->assertOk()
            ->assertJsonPath('data.total_products', 2)
            ->assertJsonPath('data.total_stock_qty', 12)
            ->assertJsonPath('data.total_stock_value', 11000)
            ->assertJsonPath('data.low_stock_count', 1);
    }

    public function test_profit_report_math(): void
    {
        $user = $this->userWithPermission();
        $today = now();
        $sale = Sale::factory()->create(['status' => 'paid', 'created_at' => $today]);
        $product = Product::factory()->create();

        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'qty' => 3,
            'price' => 10000,
            'cost_price' => 6000,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/profit?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        // revenue = 3*10000=30000, cost = 3*6000=18000, profit=12000, margin=40%
        $response->assertOk()
            ->assertJsonPath('data.revenue', 30000)
            ->assertJsonPath('data.cost', 18000)
            ->assertJsonPath('data.profit', 12000)
            ->assertJsonPath('data.margin_percent', 40);
    }

    public function test_tax_report_nets_collected_and_paid(): void
    {
        $user = $this->userWithPermission();
        $today = now();

        Sale::factory()->create(['status' => 'paid', 'tax_amount' => 5000, 'created_at' => $today]);
        Purchase::factory()->create(['status' => 'received', 'tax_amount' => 2000, 'created_at' => $today]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/tax?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()
            ->assertJsonPath('data.tax_collected', 5000)
            ->assertJsonPath('data.tax_paid', 2000)
            ->assertJsonPath('data.net_tax', 3000);
    }

    public function test_customer_report_rows(): void
    {
        $user = $this->userWithPermission();
        $today = now();
        $customer = Customer::factory()->create(['name' => 'Budi Santoso']);

        Sale::factory()->create([
            'status' => 'paid',
            'customer_id' => $customer->id,
            'grand_total' => 10000,
            'created_at' => $today,
        ]);
        Sale::factory()->create([
            'status' => 'paid',
            'customer_id' => $customer->id,
            'grand_total' => 20000,
            'created_at' => $today,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/customers?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()
            ->assertJsonPath('data.rows.0.customer_name', 'Budi Santoso')
            ->assertJsonPath('data.rows.0.order_count', 2)
            ->assertJsonPath('data.rows.0.total_spent', 30000)
            ->assertJsonPath('data.rows.0.avg_order_value', 15000);
    }

    public function test_supplier_report_rows(): void
    {
        $user = $this->userWithPermission();
        $today = now();
        $supplier = Supplier::factory()->create(['name' => 'PT Sumber Makmur']);

        Purchase::factory()->create([
            'status' => 'received',
            'supplier_id' => $supplier->id,
            'grand_total' => 40000,
            'created_at' => $today,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/suppliers?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()
            ->assertJsonPath('data.rows.0.supplier_name', 'PT Sumber Makmur')
            ->assertJsonPath('data.rows.0.order_count', 1)
            ->assertJsonPath('data.rows.0.total_purchased', 40000);
    }

    public function test_best_selling_report_orders_by_qty_sold(): void
    {
        $user = $this->userWithPermission();
        $today = now();
        $sale = Sale::factory()->create(['status' => 'paid', 'created_at' => $today]);
        $popular = Product::factory()->create(['name' => 'Produk Laris']);
        $unpopular = Product::factory()->create(['name' => 'Produk Sepi']);

        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $popular->id,
            'product_name' => $popular->name,
            'qty' => 50,
            'price' => 1000,
        ]);
        SaleItem::factory()->create([
            'sale_id' => $sale->id,
            'product_id' => $unpopular->id,
            'product_name' => $unpopular->name,
            'qty' => 1,
            'price' => 1000,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/best-selling?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()->assertJsonPath('data.rows.0.product_name', 'Produk Laris');
    }

    public function test_stock_movement_report_breakdown_and_net_change(): void
    {
        $user = $this->userWithPermission();
        $today = now();
        $product = Product::factory()->create();

        StockMovement::factory()->create([
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 10,
            'created_at' => $today,
        ]);
        StockMovement::factory()->create([
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => -4,
            'created_at' => $today,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson(
            '/api/v1/reports/stock-movements?from='.$today->copy()->subDay()->toDateString().'&to='.$today->copy()->addDay()->toDateString(),
        );

        $response->assertOk()->assertJsonPath('data.net_change', 6);

        $byType = collect($response->json('data.by_type'));
        $this->assertSame(10, $byType->firstWhere('type', 'in')['total_quantity']);
        $this->assertSame(-4, $byType->firstWhere('type', 'out')['total_quantity']);
    }

    public function test_seeded_manager_and_supervisor_have_view_reports_permission(): void
    {
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $manager = \Spatie\Permission\Models\Role::findByName('Manager');
        $supervisor = \Spatie\Permission\Models\Role::findByName('Supervisor');

        $this->assertTrue($manager->hasPermissionTo('view-reports'));
        $this->assertTrue($supervisor->hasPermissionTo('view-reports'));
    }
}
