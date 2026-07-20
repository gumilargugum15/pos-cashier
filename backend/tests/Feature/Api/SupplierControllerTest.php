<?php

namespace Tests\Feature\Api;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SupplierControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-suppliers');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-suppliers');

        return $user;
    }

    public function test_guest_cannot_list_suppliers(): void
    {
        $this->getJson('/api/v1/suppliers')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_suppliers(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/suppliers');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->create(['name' => 'PT Sumber Makmur']);
        Supplier::factory()->create(['name' => 'CV Jaya Abadi']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/suppliers?search=Sumber');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'PT Sumber Makmur');
    }

    public function test_list_can_be_filtered_by_status(): void
    {
        $user = User::factory()->create();
        Supplier::factory()->create(['is_active' => true]);
        Supplier::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/suppliers?is_active=0');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_active', false);
    }

    public function test_user_without_permission_cannot_create_supplier(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/suppliers', ['name' => 'Acme']);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_supplier(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/suppliers', [
            'name' => 'PT Acme Distribusi',
            'contact_person' => 'Budi',
            'phone' => '081234567890',
            'email' => 'acme@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'PT Acme Distribusi')
            ->assertJsonPath('data.contact_person', 'Budi')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('suppliers', ['name' => 'PT Acme Distribusi', 'email' => 'acme@example.com']);
    }

    public function test_create_fails_validation_without_name(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/suppliers', []);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_duplicate_email(): void
    {
        $user = $this->userWithPermission();
        Supplier::factory()->create(['email' => 'dup@example.com']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/suppliers', [
            'name' => 'Another Supplier',
            'email' => 'dup@example.com',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_supplier(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/suppliers/{$supplier->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $supplier->fresh()->name);
    }

    public function test_user_with_permission_can_delete_supplier(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/suppliers/{$supplier->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    public function test_deleted_supplier_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $supplier = Supplier::factory()->create();
        $supplier->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/suppliers');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
