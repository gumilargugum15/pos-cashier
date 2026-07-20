<?php

namespace Tests\Feature\Api;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class BrandControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-products');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-products');

        return $user;
    }

    public function test_guest_cannot_list_brands(): void
    {
        $this->getJson('/api/v1/brands')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_brands(): void
    {
        $user = User::factory()->create();
        Brand::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/brands');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Brand::factory()->create(['name' => 'Voltix Electronics']);
        Brand::factory()->create(['name' => 'FreshCo Grocery']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/brands?search=Voltix');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Voltix Electronics');
    }

    public function test_user_without_permission_cannot_create_brand(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/brands', ['name' => 'Acme']);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_brand(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/brands', ['name' => 'Acme']);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Acme')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('brands', ['name' => 'Acme']);
    }

    public function test_create_fails_validation_without_name(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/brands', []);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_brand(): void
    {
        $user = $this->userWithPermission();
        $brand = Brand::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/brands/{$brand->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $brand->fresh()->name);
    }

    public function test_user_with_permission_can_delete_brand(): void
    {
        $user = $this->userWithPermission();
        $brand = Brand::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/brands/{$brand->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('brands', ['id' => $brand->id]);
    }

    public function test_deleted_brand_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $brand = Brand::factory()->create();
        $brand->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/brands');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
