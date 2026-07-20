<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class WarehouseControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-settings');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        return $user;
    }

    public function test_guest_cannot_list_warehouses(): void
    {
        $this->getJson('/api/v1/warehouses')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_warehouses(): void
    {
        $user = User::factory()->create();
        Warehouse::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/warehouses');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Warehouse::factory()->create(['name' => 'Gudang Jakarta', 'code' => 'WH-001']);
        Warehouse::factory()->create(['name' => 'Gudang Surabaya', 'code' => 'WH-002']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/warehouses?search=Jakarta');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Gudang Jakarta');
    }

    public function test_user_without_permission_cannot_create_warehouse(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/warehouses', [
            'name' => 'Gudang Bandung',
            'code' => 'WH-003',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_warehouse(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/warehouses', [
            'name' => 'Gudang Bandung',
            'code' => 'WH-003',
            'phone' => '022-1234567',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Gudang Bandung')
            ->assertJsonPath('data.code', 'WH-003')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('warehouses', ['name' => 'Gudang Bandung', 'code' => 'WH-003']);
    }

    public function test_create_fails_validation_without_code(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/warehouses', ['name' => 'No Code']);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_duplicate_code(): void
    {
        $user = $this->userWithPermission();
        Warehouse::factory()->create(['code' => 'WH-DUP']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/warehouses', [
            'name' => 'Another Warehouse',
            'code' => 'WH-DUP',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_warehouse(): void
    {
        $user = $this->userWithPermission();
        $warehouse = Warehouse::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/warehouses/{$warehouse->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $warehouse->fresh()->name);
    }

    public function test_updating_warehouse_can_keep_its_own_code(): void
    {
        $user = $this->userWithPermission();
        $warehouse = Warehouse::factory()->create(['code' => 'WH-KEEP']);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/warehouses/{$warehouse->id}", [
            'name' => 'Updated Name',
            'code' => 'WH-KEEP',
        ]);

        $response->assertOk()->assertJsonPath('data.code', 'WH-KEEP');
    }

    public function test_user_with_permission_can_delete_warehouse(): void
    {
        $user = $this->userWithPermission();
        $warehouse = Warehouse::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/warehouses/{$warehouse->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('warehouses', ['id' => $warehouse->id]);
    }

    public function test_deleted_warehouse_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $warehouse = Warehouse::factory()->create();
        $warehouse->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/warehouses');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
