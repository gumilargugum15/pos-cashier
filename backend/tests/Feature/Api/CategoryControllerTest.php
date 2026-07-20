<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-products');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-products');

        return $user;
    }

    public function test_guest_cannot_list_categories(): void
    {
        $this->getJson('/api/v1/categories')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_categories(): void
    {
        $user = User::factory()->create();
        Category::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/categories');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Category::factory()->create(['name' => 'Minuman Segar', 'slug' => 'minuman-segar']);
        Category::factory()->create(['name' => 'Makanan Ringan', 'slug' => 'makanan-ringan']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/categories?search=Minuman');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Minuman Segar');
    }

    public function test_list_can_be_filtered_by_status(): void
    {
        $user = User::factory()->create();
        Category::factory()->create(['is_active' => true]);
        Category::factory()->create(['is_active' => false]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/categories?is_active=0');

        $response->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_active', false);
    }

    public function test_list_can_be_sorted(): void
    {
        $user = User::factory()->create();
        Category::factory()->create(['name' => 'Zebra']);
        Category::factory()->create(['name' => 'Apple']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/categories?sort=name&direction=desc');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name');
        $this->assertSame(['Zebra', 'Apple'], $names->all());
    }

    public function test_user_without_permission_cannot_create_category(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/categories', [
            'name' => 'Elektronik',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_category(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/categories', [
            'name' => 'Elektronik',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Elektronik')
            ->assertJsonPath('data.slug', 'elektronik')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('categories', ['name' => 'Elektronik', 'slug' => 'elektronik']);
    }

    public function test_create_fails_validation_without_name(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/categories', []);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_category(): void
    {
        $user = $this->userWithPermission();
        $category = Category::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/categories/{$category->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $category->fresh()->name);
    }

    public function test_user_with_permission_can_delete_category(): void
    {
        $user = $this->userWithPermission();
        $category = Category::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/v1/categories/{$category->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }

    public function test_deleted_category_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $category = Category::factory()->create();
        $category->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/categories');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
