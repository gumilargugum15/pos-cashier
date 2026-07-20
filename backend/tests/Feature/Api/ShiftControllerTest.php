<?php

namespace Tests\Feature\Api;

use App\Models\Sale;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ShiftControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('operate-cash-drawer', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('operate-cash-drawer');

        return $user;
    }

    private function userWithManageFinance(): User
    {
        Permission::findOrCreate('manage-finance', 'web');
        Permission::findOrCreate('operate-cash-drawer', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo(['manage-finance', 'operate-cash-drawer']);

        return $user;
    }

    public function test_guest_cannot_open_shift(): void
    {
        $this->postJson('/api/v1/shifts', ['opening_balance' => 100000])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_open_shift(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', [
            'opening_balance' => 100000,
        ]);

        $response->assertStatus(403);
    }

    public function test_user_can_open_shift(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', [
            'opening_balance' => 150000,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.opening_balance', 150000);

        $this->assertDatabaseHas('shifts', ['user_id' => $user->id, 'status' => 'open']);
    }

    public function test_cannot_open_second_shift_while_one_open(): void
    {
        $user = $this->userWithPermission();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', [
            'opening_balance' => 50000,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseCount('shifts', 1);
    }

    public function test_close_shift_computes_expected_balance_and_variance(): void
    {
        $user = $this->userWithPermission();

        $open = $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);
        $shiftId = $open->json('data.id');

        Sale::factory()->create([
            'status' => 'paid',
            'payment_method' => 'cash',
            'grand_total' => 50000,
            'created_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 20000,
            'description' => 'Pendapatan lain',
        ]);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'out',
            'category' => 'expense',
            'amount' => 5000,
            'description' => 'Beli galon air',
        ]);

        // expected = 100000 + 50000 (cash sale) + 20000 (in) - 5000 (out) = 165000
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/shifts/{$shiftId}/close", [
            'closing_balance' => 160000,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'closed')
            ->assertJsonPath('data.expected_balance', 165000)
            ->assertJsonPath('data.closing_balance', 160000)
            ->assertJsonPath('data.variance', -5000);
    }

    public function test_cannot_close_already_closed_shift(): void
    {
        $user = $this->userWithPermission();
        $shift = Shift::factory()->create(['user_id' => $user->id, 'status' => 'closed']);

        $response = $this->actingAs($user, 'sanctum')->postJson("/api/v1/shifts/{$shift->id}/close", [
            'closing_balance' => 100000,
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_without_manage_finance_cannot_view_or_close_another_users_shift(): void
    {
        $user = $this->userWithPermission();
        $other = Shift::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson("/api/v1/shifts/{$other->id}")->assertStatus(403);
        $this->actingAs($user, 'sanctum')->postJson("/api/v1/shifts/{$other->id}/close", [
            'closing_balance' => 100000,
        ])->assertStatus(403);
    }

    public function test_user_with_manage_finance_can_view_and_close_another_users_shift(): void
    {
        $admin = $this->userWithManageFinance();
        $other = Shift::factory()->create(['opening_balance' => 100000]);

        $this->actingAs($admin, 'sanctum')->getJson("/api/v1/shifts/{$other->id}")->assertOk();

        $response = $this->actingAs($admin, 'sanctum')->postJson("/api/v1/shifts/{$other->id}/close", [
            'closing_balance' => 100000,
        ]);
        $response->assertOk()->assertJsonPath('data.status', 'closed');
    }

    public function test_current_endpoint_returns_open_shift_or_null(): void
    {
        $user = $this->userWithPermission();

        $none = $this->actingAs($user, 'sanctum')->getJson('/api/v1/shifts/current');
        $none->assertOk()->assertJsonPath('data.shift', null);

        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);

        $withShift = $this->actingAs($user, 'sanctum')->getJson('/api/v1/shifts/current');
        $withShift->assertOk()->assertJsonPath('data.shift.status', 'open');
    }

    public function test_list_scoped_to_own_shifts_unless_manage_finance(): void
    {
        $user = $this->userWithPermission();
        Shift::factory()->count(2)->create(['user_id' => $user->id]);
        Shift::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/shifts');
        $response->assertOk()->assertJsonCount(2, 'data');

        $admin = $this->userWithManageFinance();
        $adminResponse = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/shifts');
        $adminResponse->assertOk()->assertJsonCount(5, 'data');
    }

    public function test_seeded_kasir_has_operate_cash_drawer_permission(): void
    {
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $kasir = \Spatie\Permission\Models\Role::findByName('Kasir');

        $this->assertTrue($kasir->hasPermissionTo('operate-cash-drawer'));
    }
}
