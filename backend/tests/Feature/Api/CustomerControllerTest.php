<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CustomerControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-customers');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-customers');

        return $user;
    }

    public function test_guest_cannot_list_customers(): void
    {
        $this->getJson('/api/v1/customers')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_customers(): void
    {
        $user = User::factory()->create();
        Customer::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/customers');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Customer::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
        Customer::factory()->create(['name' => 'Siti Aminah', 'email' => 'siti@example.com']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/customers?search=Budi');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Budi Santoso');
    }

    public function test_list_can_be_filtered_by_status(): void
    {
        $user = User::factory()->create();
        Customer::factory()->create(['is_active' => true]);
        Customer::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/customers?is_active=0');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_active', false);
    }

    public function test_user_without_permission_cannot_create_customer(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customers', ['name' => 'Andi']);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_customer(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customers', [
            'name' => 'Andi Wijaya',
            'phone' => '081234567890',
            'email' => 'andi@example.com',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Andi Wijaya')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('customers', ['name' => 'Andi Wijaya', 'email' => 'andi@example.com']);
    }

    public function test_create_fails_validation_without_name(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customers', []);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_duplicate_email(): void
    {
        $user = $this->userWithPermission();
        Customer::factory()->create(['email' => 'dup@example.com']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/customers', [
            'name' => 'Another Person',
            'email' => 'dup@example.com',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_customer(): void
    {
        $user = $this->userWithPermission();
        $customer = Customer::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/customers/{$customer->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $customer->fresh()->name);
    }

    public function test_updating_customer_can_keep_its_own_email(): void
    {
        $user = $this->userWithPermission();
        $customer = Customer::factory()->create(['email' => 'keep@example.com']);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/customers/{$customer->id}", [
            'name' => 'Updated Name',
            'email' => 'keep@example.com',
        ]);

        $response->assertOk()->assertJsonPath('data.email', 'keep@example.com');
    }

    public function test_user_with_permission_can_delete_customer(): void
    {
        $user = $this->userWithPermission();
        $customer = Customer::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/customers/{$customer->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }

    public function test_deleted_customer_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $customer = Customer::factory()->create();
        $customer->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/customers');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
