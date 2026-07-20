<?php

namespace Tests\Feature\Api;

use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UnitControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-products');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-products');

        return $user;
    }

    public function test_guest_cannot_list_units(): void
    {
        $this->getJson('/api/v1/units')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_units(): void
    {
        $user = User::factory()->create();
        Unit::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/units');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Unit::factory()->create(['name' => 'Kilogram', 'symbol' => 'kg']);
        Unit::factory()->create(['name' => 'Pieces', 'symbol' => 'pcs']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/units?search=Kilogram');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Kilogram');
    }

    public function test_user_without_permission_cannot_create_unit(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/units', ['name' => 'Box', 'symbol' => 'box']);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_unit(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/units', ['name' => 'Box', 'symbol' => 'box']);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Box')
            ->assertJsonPath('data.symbol', 'box');

        $this->assertDatabaseHas('units', ['name' => 'Box', 'symbol' => 'box']);
    }

    public function test_create_fails_validation_without_symbol(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/units', ['name' => 'Box']);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_unit(): void
    {
        $user = $this->userWithPermission();
        $unit = Unit::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/units/{$unit->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $unit->fresh()->name);
    }

    public function test_user_with_permission_can_delete_unit(): void
    {
        $user = $this->userWithPermission();
        $unit = Unit::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/units/{$unit->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('units', ['id' => $unit->id]);
    }

    public function test_deleted_unit_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $unit = Unit::factory()->create();
        $unit->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/units');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
