<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SaleControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-sales');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-sales');

        return $user;
    }

    public function test_guest_cannot_checkout(): void
    {
        $this->postJson('/api/v1/sales', [])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_checkout(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 10000, 'stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_checkout(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create([
            'price' => 10000,
            'cost_price' => 6000,
            'stock' => 10,
            'tax_percentage' => 11,
            'discount_percentage' => 0,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 2]],
            'payment_method' => 'cash',
            'paid_amount' => 25000,
        ]);

        // subtotal = 20000, discount = 0, tax = 11% of 20000 = 2200, grand_total = 22200
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', 20000)
            ->assertJsonPath('data.tax_amount', 2200)
            ->assertJsonPath('data.discount_amount', 0)
            ->assertJsonPath('data.grand_total', 22200)
            ->assertJsonPath('data.paid_amount', 25000)
            ->assertJsonPath('data.change_amount', 2800)
            ->assertJsonPath('data.payment_method', 'cash')
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonCount(1, 'data.items');

        $invoiceNumber = $response->json('data.invoice_number');
        $this->assertMatchesRegularExpression('/^TX-\d{6}-\d{5}$/', $invoiceNumber);

        $this->assertSame(8, $product->fresh()->stock);
        $this->assertDatabaseHas('sales', ['invoice_number' => $invoiceNumber, 'user_id' => $user->id]);
        $this->assertDatabaseHas('sale_items', ['product_id' => $product->id, 'qty' => 2]);
    }

    public function test_checkout_applies_product_discount_percentage(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create([
            'price' => 10000,
            'stock' => 10,
            'tax_percentage' => 11,
            'discount_percentage' => 10,
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => 10000,
        ]);

        // gross = 10000, discount = 10% = 1000, beforeTax = 9000, tax = 11% of 9000 = 990, grand_total = 9990
        $response->assertStatus(201)
            ->assertJsonPath('data.discount_amount', 1000)
            ->assertJsonPath('data.tax_amount', 990)
            ->assertJsonPath('data.grand_total', 9990);
    }

    public function test_checkout_with_customer(): void
    {
        $user = $this->userWithPermission();
        $customer = Customer::factory()->create();
        $product = Product::factory()->create(['price' => 5000, 'stock' => 5]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'customer_id' => $customer->id,
            'items' => [['product_id' => $product->id, 'qty' => 1]],
            'payment_method' => 'qris',
            'paid_amount' => 5550,
        ]);

        $response->assertStatus(201)->assertJsonPath('data.customer.id', $customer->id);
    }

    public function test_checkout_fails_with_insufficient_stock(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 1]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 5]],
            'payment_method' => 'cash',
            'paid_amount' => 999999,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertSame(1, $product->fresh()->stock);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_checkout_fails_without_items(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'payment_method' => 'cash',
            'paid_amount' => 1000,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_checkout_fails_when_paid_amount_is_less_than_total(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['price' => 10000, 'stock' => 10, 'tax_percentage' => 0, 'discount_percentage' => 0]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 1]],
            'payment_method' => 'cash',
            'paid_amount' => 5000,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_authenticated_user_can_list_sales(): void
    {
        $user = User::factory()->create();
        Sale::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/sales');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_cannot_list_sales(): void
    {
        $this->getJson('/api/v1/sales')->assertStatus(401);
    }

    public function test_seeded_kasir_role_has_manage_sales_permission(): void
    {
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $kasir = \Spatie\Permission\Models\Role::findByName('Kasir');

        $this->assertTrue($kasir->hasPermissionTo('manage-sales'));
    }

    public function test_guest_cannot_refund_sale(): void
    {
        $sale = Sale::factory()->create(['status' => 'paid']);

        $this->postJson("/api/v1/sales/{$sale->id}/refund")->assertStatus(401);
    }

    public function test_user_without_permission_cannot_refund_sale(): void
    {
        $user = User::factory()->create();
        $sale = Sale::factory()->create(['status' => 'paid']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/sales/{$sale->id}/refund");

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_refund_paid_sale(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['price' => 10000, 'stock' => 10]);

        $checkout = $this->actingAs($user, 'sanctum')->postJson('/api/v1/sales', [
            'items' => [['product_id' => $product->id, 'qty' => 3]],
            'payment_method' => 'cash',
            'paid_amount' => 999999,
        ]);
        $saleId = $checkout->json('data.id');

        $this->assertSame(7, $product->fresh()->stock);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/sales/{$saleId}/refund");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'refunded');

        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_cannot_refund_already_refunded_sale(): void
    {
        $user = $this->userWithPermission();
        $sale = Sale::factory()->create(['status' => 'refunded']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/sales/{$sale->id}/refund");

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_cannot_refund_pending_sale(): void
    {
        $user = $this->userWithPermission();
        $sale = Sale::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/sales/{$sale->id}/refund");

        $response->assertStatus(422)->assertJsonPath('success', false);
    }
}
