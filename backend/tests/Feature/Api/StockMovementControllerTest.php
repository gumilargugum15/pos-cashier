<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class StockMovementControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-inventory');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-inventory');

        return $user;
    }

    public function test_guest_cannot_record_movement(): void
    {
        $this->postJson('/api/v1/stock-movements', [])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_record_movement(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 5,
        ]);

        $response->assertStatus(403);
    }

    public function test_stock_in_increases_stock(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 15,
            'reason' => 'Barang retur dari customer',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'in')
            ->assertJsonPath('data.quantity', 15)
            ->assertJsonPath('data.stock_before', 10)
            ->assertJsonPath('data.stock_after', 25);

        $this->assertSame(25, $product->fresh()->stock);

        $referenceNumber = $response->json('data.reference_number');
        $this->assertMatchesRegularExpression('/^INV-\d{6}-\d{5}$/', $referenceNumber);
    }

    public function test_stock_out_decreases_stock(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 20]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => 8,
            'reason' => 'Barang rusak',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'out')
            ->assertJsonPath('data.quantity', -8)
            ->assertJsonPath('data.stock_before', 20)
            ->assertJsonPath('data.stock_after', 12);

        $this->assertSame(12, $product->fresh()->stock);
    }

    public function test_stock_out_fails_with_insufficient_stock(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 3]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => 10,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseCount('stock_movements', 0);
    }

    public function test_adjustment_computes_positive_delta(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'adjustment',
            'new_stock' => 14,
            'reason' => 'Hasil stok opname',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'adjustment')
            ->assertJsonPath('data.quantity', 4)
            ->assertJsonPath('data.stock_before', 10)
            ->assertJsonPath('data.stock_after', 14);

        $this->assertSame(14, $product->fresh()->stock);
    }

    public function test_adjustment_computes_negative_delta(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'adjustment',
            'new_stock' => 6,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.quantity', -4)
            ->assertJsonPath('data.stock_after', 6);

        $this->assertSame(6, $product->fresh()->stock);
    }

    public function test_transfer_does_not_change_stock_and_requires_different_warehouses(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 30]);
        $warehouseA = Warehouse::factory()->create();
        $warehouseB = Warehouse::factory()->create();

        $mismatched = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'transfer',
            'quantity' => 5,
            'from_warehouse_id' => $warehouseA->id,
            'to_warehouse_id' => $warehouseA->id,
        ]);
        $mismatched->assertStatus(422)->assertJsonPath('success', false);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'transfer',
            'quantity' => 5,
            'from_warehouse_id' => $warehouseA->id,
            'to_warehouse_id' => $warehouseB->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'transfer')
            ->assertJsonPath('data.quantity', 5)
            ->assertJsonPath('data.stock_before', 30)
            ->assertJsonPath('data.stock_after', 30)
            ->assertJsonPath('data.from_warehouse.id', $warehouseA->id)
            ->assertJsonPath('data.to_warehouse.id', $warehouseB->id);

        $this->assertSame(30, $product->fresh()->stock);
    }

    public function test_create_fails_without_required_fields(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'adjustment',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_authenticated_user_can_list_movements(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['stock' => 10]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/stock-movements', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 5,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/stock-movements');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_guest_cannot_list_movements(): void
    {
        $this->getJson('/api/v1/stock-movements')->assertStatus(401);
    }

    public function test_seeded_gudang_role_has_manage_inventory_permission(): void
    {
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $gudang = \Spatie\Permission\Models\Role::findByName('Gudang');

        $this->assertTrue($gudang->hasPermissionTo('manage-inventory'));
    }
}
