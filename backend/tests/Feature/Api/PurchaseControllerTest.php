<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PurchaseControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-purchases');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-purchases');

        return $user;
    }

    public function test_guest_cannot_create_purchase(): void
    {
        $this->postJson('/api/v1/purchases', [])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_create_purchase(): void
    {
        $user = User::factory()->create();
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/purchases', [
            'supplier_id' => $supplier->id,
            'items' => [['product_id' => $product->id, 'qty' => 1, 'cost_price' => 1000]],
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_purchase(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();
        $productA = Product::factory()->create();
        $productB = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/purchases', [
            'supplier_id' => $supplier->id,
            'items' => [
                ['product_id' => $productA->id, 'qty' => 2, 'cost_price' => 5000],
                ['product_id' => $productB->id, 'qty' => 1, 'cost_price' => 3000],
            ],
            'discount_percentage' => 10,
            'tax_percentage' => 11,
        ]);

        // subtotal = 10000 + 3000 = 13000, discount = 10% = 1300, beforeTax = 11700, tax = 11% of 11700 = 1287, grand_total = 12987
        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', 13000)
            ->assertJsonPath('data.discount_amount', 1300)
            ->assertJsonPath('data.tax_amount', 1287)
            ->assertJsonPath('data.grand_total', 12987)
            ->assertJsonPath('data.paid_amount', 0)
            ->assertJsonPath('data.remaining_amount', 12987)
            ->assertJsonPath('data.payment_status', 'unpaid')
            ->assertJsonPath('data.status', 'ordered')
            ->assertJsonCount(2, 'data.items');

        $purchaseNumber = $response->json('data.purchase_number');
        $this->assertMatchesRegularExpression('/^PO-\d{6}-\d{5}$/', $purchaseNumber);

        $this->assertDatabaseHas('purchases', ['purchase_number' => $purchaseNumber, 'supplier_id' => $supplier->id]);
        $this->assertDatabaseHas('purchase_items', ['product_id' => $productA->id, 'qty' => 2, 'cost_price' => 5000]);
    }

    public function test_create_fails_without_items(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/purchases', [
            'supplier_id' => $supplier->id,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_receiving_purchase_increments_stock_and_updates_cost_price(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create(['stock' => 5, 'cost_price' => 1000]);

        $create = $this->actingAs($user, 'sanctum')->postJson('/api/v1/purchases', [
            'supplier_id' => $supplier->id,
            'items' => [['product_id' => $product->id, 'qty' => 10, 'cost_price' => 1500]],
        ]);
        $purchaseId = $create->json('data.id');

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchaseId}/receive");

        $response->assertOk()
            ->assertJsonPath('data.status', 'received')
            ->assertJsonPath('data.received_at', fn ($value) => $value !== null);

        $this->assertSame(15, $product->fresh()->stock);
        $this->assertEquals(1500, $product->fresh()->cost_price);
    }

    public function test_cannot_receive_already_received_purchase(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'received']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/receive");

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_cancelling_ordered_purchase_succeeds(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'ordered']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/cancel");

        $response->assertOk()->assertJsonPath('data.status', 'cancelled');
    }

    public function test_cannot_cancel_received_purchase(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'received']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/cancel");

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_recording_partial_then_full_payment_updates_status(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['grand_total' => 10000, 'paid_amount' => 0, 'payment_status' => 'unpaid']);

        $partial = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/pay", ['amount' => 4000]);
        $partial->assertOk()
            ->assertJsonPath('data.paid_amount', 4000)
            ->assertJsonPath('data.remaining_amount', 6000)
            ->assertJsonPath('data.payment_status', 'partial');

        $full = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/pay", ['amount' => 6000]);
        $full->assertOk()
            ->assertJsonPath('data.paid_amount', 10000)
            ->assertJsonPath('data.remaining_amount', 0)
            ->assertJsonPath('data.payment_status', 'paid');
    }

    public function test_payment_exceeding_remaining_is_rejected(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['grand_total' => 10000, 'paid_amount' => 0]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/pay", ['amount' => 15000]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertEquals(0, $purchase->fresh()->paid_amount);
    }

    public function test_cannot_pay_cancelled_purchase(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'cancelled', 'grand_total' => 10000]);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/purchases/{$purchase->id}/pay", ['amount' => 1000]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_cannot_delete_received_purchase(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'received']);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/purchases/{$purchase->id}");

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseHas('purchases', ['id' => $purchase->id, 'deleted_at' => null]);
    }

    public function test_can_delete_ordered_purchase(): void
    {
        $user = $this->userWithPermission();
        $purchase = Purchase::factory()->create(['status' => 'ordered']);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/purchases/{$purchase->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('purchases', ['id' => $purchase->id]);
    }

    public function test_cannot_update_non_ordered_purchase(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();
        $product = Product::factory()->create();
        $purchase = Purchase::factory()->create(['status' => 'received']);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/purchases/{$purchase->id}", [
            'supplier_id' => $supplier->id,
            'items' => [['product_id' => $product->id, 'qty' => 1, 'cost_price' => 1000]],
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_list_purchases(): void
    {
        $user = User::factory()->create();
        Purchase::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/purchases');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_guest_cannot_list_purchases(): void
    {
        $this->getJson('/api/v1/purchases')->assertStatus(401);
    }

    public function test_seeded_admin_role_has_manage_purchases_permission(): void
    {
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $admin = \Spatie\Permission\Models\Role::findByName('Admin');

        $this->assertTrue($admin->hasPermissionTo('manage-purchases'));
    }
}
