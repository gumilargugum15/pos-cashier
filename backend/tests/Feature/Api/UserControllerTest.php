<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-users');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-users');

        return $user;
    }

    public function test_guest_cannot_list_users(): void
    {
        $this->getJson('/api/v1/users')->assertStatus(401);
    }

    public function test_user_without_permission_cannot_list_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/users')->assertStatus(403);
    }

    public function test_user_with_permission_can_list_users(): void
    {
        $user = $this->userWithPermission();
        User::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/users');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(4, 'data') // 3 + the acting admin
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = $this->userWithPermission();
        User::factory()->create(['name' => 'Kasir Satu', 'email' => 'kasir1@example.com']);
        User::factory()->create(['name' => 'Kasir Dua', 'email' => 'kasir2@example.com']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/users?search=Kasir Satu');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Kasir Satu');
    }

    public function test_user_with_permission_can_create_user_with_role(): void
    {
        $admin = $this->userWithPermission();
        Role::findOrCreate('Kasir');

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/users', [
            'name' => 'New Cashier',
            'email' => 'newcashier@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'roles' => ['Kasir'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'New Cashier')
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.roles.0', 'Kasir');

        $this->assertDatabaseHas('users', ['email' => 'newcashier@example.com']);
        $newUser = User::where('email', 'newcashier@example.com')->first();
        $this->assertTrue(Hash::check('password123', $newUser->password));
    }

    public function test_create_fails_validation_with_duplicate_email(): void
    {
        $admin = $this->userWithPermission();
        User::factory()->create(['email' => 'dup@example.com']);

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/users', [
            'name' => 'Another User',
            'email' => 'dup@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_mismatched_password_confirmation(): void
    {
        $admin = $this->userWithPermission();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/users', [
            'name' => 'Another User',
            'email' => 'another@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_user_and_roles(): void
    {
        $admin = $this->userWithPermission();
        Role::findOrCreate('Supervisor');
        $target = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($admin, 'sanctum')->putJson("/api/v1/users/{$target->id}", [
            'name' => 'New Name',
            'roles' => ['Supervisor'],
        ]);

        $response->assertOk()->assertJsonPath('data.name', 'New Name')->assertJsonPath('data.roles.0', 'Supervisor');
        $this->assertSame('New Name', $target->fresh()->name);
    }

    public function test_updating_password_is_optional(): void
    {
        $admin = $this->userWithPermission();
        $target = User::factory()->create(['password' => Hash::make('original-password')]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/users/{$target->id}", ['name' => 'Renamed Only']);

        $response->assertOk();
        $this->assertTrue(Hash::check('original-password', $target->fresh()->password));
    }

    public function test_user_with_permission_can_delete_another_user(): void
    {
        $admin = $this->userWithPermission();
        $target = User::factory()->create();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/users/{$target->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_user_cannot_delete_own_account(): void
    {
        $admin = $this->userWithPermission();

        $response = $this->actingAs($admin, 'sanctum')->deleteJson("/api/v1/users/{$admin->id}");

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseHas('users', ['id' => $admin->id, 'deleted_at' => null]);
    }

    public function test_deleted_user_does_not_appear_in_list(): void
    {
        $admin = $this->userWithPermission();
        $target = User::factory()->create();
        $target->delete();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/users');

        $response->assertOk()->assertJsonCount(1, 'data'); // only the acting admin
    }
}
