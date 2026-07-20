<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-users');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-users');

        return $user;
    }

    public function test_guest_cannot_list_roles(): void
    {
        $this->getJson('/api/v1/roles')->assertStatus(401);
    }

    public function test_user_without_permission_cannot_list_roles(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/roles')->assertStatus(403);
    }

    public function test_user_with_permission_can_list_roles(): void
    {
        $user = $this->userWithPermission();
        Role::findOrCreate('Kasir');
        Role::findOrCreate('Gudang');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/roles');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_user_with_permission_can_create_role_with_permissions(): void
    {
        $user = $this->userWithPermission();
        Permission::findOrCreate('manage-sales');
        Permission::findOrCreate('view-reports');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/roles', [
            'name' => 'Sales Manager',
            'permissions' => ['manage-sales', 'view-reports'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Sales Manager');

        $this->assertDatabaseHas('roles', ['name' => 'Sales Manager']);
        $role = Role::where('name', 'Sales Manager')->first();
        $this->assertTrue($role->hasPermissionTo('manage-sales'));
        $this->assertTrue($role->hasPermissionTo('view-reports'));
    }

    public function test_create_fails_validation_with_duplicate_name(): void
    {
        $user = $this->userWithPermission();
        Role::findOrCreate('Duplicate Role');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/roles', ['name' => 'Duplicate Role']);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_unknown_permission(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/roles', [
            'name' => 'New Role',
            'permissions' => ['nonexistent-permission'],
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_role_permissions(): void
    {
        $user = $this->userWithPermission();
        Permission::findOrCreate('manage-sales');
        $role = Role::findOrCreate('Editable Role');

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/roles/{$role->id}", [
            'permissions' => ['manage-sales'],
        ]);

        $response->assertOk();
        $this->assertTrue($role->fresh()->hasPermissionTo('manage-sales'));
    }

    public function test_user_with_permission_can_delete_unused_role(): void
    {
        $user = $this->userWithPermission();
        $role = Role::findOrCreate('Unused Role');

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_cannot_delete_role_still_assigned_to_a_user(): void
    {
        $user = $this->userWithPermission();
        $role = Role::findOrCreate('Assigned Role');
        $anotherUser = User::factory()->create();
        $anotherUser->assignRole($role);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }
}
