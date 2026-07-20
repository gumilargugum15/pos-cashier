<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-users');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-users');

        return $user;
    }

    public function test_guest_cannot_list_permissions(): void
    {
        $this->getJson('/api/v1/permissions')->assertStatus(401);
    }

    public function test_user_without_permission_cannot_list_permissions(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/permissions')->assertStatus(403);
    }

    public function test_user_with_permission_can_list_permissions(): void
    {
        $user = $this->userWithPermission();
        Permission::findOrCreate('view-reports');
        Permission::findOrCreate('manage-sales');

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/permissions');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_user_with_permission_can_create_permission(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/permissions', [
            'name' => 'manage-new-feature',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'manage-new-feature');

        $this->assertDatabaseHas('permissions', ['name' => 'manage-new-feature']);
    }

    public function test_create_fails_validation_with_duplicate_name(): void
    {
        $user = $this->userWithPermission();
        Permission::findOrCreate('duplicate-permission');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/permissions', [
            'name' => 'duplicate-permission',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_permission(): void
    {
        $user = $this->userWithPermission();
        $permission = Permission::findOrCreate('old-name');

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/permissions/{$permission->id}", ['name' => 'new-name']);

        $response->assertOk()->assertJsonPath('data.name', 'new-name');
    }

    public function test_user_with_permission_can_delete_unused_permission(): void
    {
        $user = $this->userWithPermission();
        $permission = Permission::findOrCreate('unused-permission');

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/permissions/{$permission->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
    }

    public function test_cannot_delete_permission_still_assigned_to_a_role(): void
    {
        $user = $this->userWithPermission();
        $permission = Permission::findOrCreate('in-use-permission');
        $role = Role::findOrCreate('SomeRole');
        $role->givePermissionTo($permission);

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/permissions/{$permission->id}");

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseHas('permissions', ['id' => $permission->id]);
    }
}
