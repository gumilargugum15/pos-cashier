<?php

namespace Tests\Feature\Api;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class BranchControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-settings');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        return $user;
    }

    public function test_guest_cannot_list_branches(): void
    {
        $this->getJson('/api/v1/branches')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_branches(): void
    {
        $user = User::factory()->create();
        Branch::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/branches');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Branch::factory()->create(['name' => 'Jakarta Branch', 'code' => 'BR-001']);
        Branch::factory()->create(['name' => 'Surabaya Branch', 'code' => 'BR-002']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/branches?search=Jakarta');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Jakarta Branch');
    }

    public function test_user_without_permission_cannot_create_branch(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/branches', [
            'name' => 'Bandung Branch',
            'code' => 'BR-003',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_branch(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/branches', [
            'name' => 'Bandung Branch',
            'code' => 'BR-003',
            'phone' => '022-1234567',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Bandung Branch')
            ->assertJsonPath('data.code', 'BR-003')
            ->assertJsonPath('data.is_active', true);

        $this->assertDatabaseHas('branches', ['name' => 'Bandung Branch', 'code' => 'BR-003']);
    }

    public function test_create_fails_validation_without_code(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/branches', ['name' => 'No Code Branch']);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_duplicate_code(): void
    {
        $user = $this->userWithPermission();
        Branch::factory()->create(['code' => 'BR-DUP']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/branches', [
            'name' => 'Another Branch',
            'code' => 'BR-DUP',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_update_branch(): void
    {
        $user = $this->userWithPermission();
        $branch = Branch::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/branches/{$branch->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $branch->fresh()->name);
    }

    public function test_updating_branch_can_keep_its_own_code(): void
    {
        $user = $this->userWithPermission();
        $branch = Branch::factory()->create(['code' => 'BR-KEEP']);

        $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/branches/{$branch->id}", [
            'name' => 'Updated Name',
            'code' => 'BR-KEEP',
        ]);

        $response->assertOk()->assertJsonPath('data.code', 'BR-KEEP');
    }

    public function test_user_with_permission_can_delete_branch(): void
    {
        $user = $this->userWithPermission();
        $branch = Branch::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/branches/{$branch->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('branches', ['id' => $branch->id]);
    }

    public function test_deleted_branch_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $branch = Branch::factory()->create();
        $branch->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/branches');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
