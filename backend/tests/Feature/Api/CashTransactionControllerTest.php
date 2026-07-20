<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class CashTransactionControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('operate-cash-drawer', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('operate-cash-drawer');

        return $user;
    }

    public function test_guest_cannot_record_transaction(): void
    {
        $this->postJson('/api/v1/cash-transactions', [])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_record_transaction(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 10000,
            'description' => 'Test',
        ]);

        $response->assertStatus(403);
    }

    public function test_cannot_record_transaction_without_open_shift(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 10000,
            'description' => 'Test',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertDatabaseCount('cash_transactions', 0);
    }

    public function test_can_record_cash_in_income_while_shift_open(): void
    {
        $user = $this->userWithPermission();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 25000,
            'description' => 'Pendapatan sewa alat',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'in')
            ->assertJsonPath('data.category', 'income')
            ->assertJsonPath('data.amount', 25000);

        $referenceNumber = $response->json('data.reference_number');
        $this->assertMatchesRegularExpression('/^FIN-\d{6}-\d{5}$/', $referenceNumber);
    }

    public function test_can_record_cash_out_expense_while_shift_open(): void
    {
        $user = $this->userWithPermission();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'out',
            'category' => 'expense',
            'amount' => 15000,
            'description' => 'Beli alat tulis',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'out')
            ->assertJsonPath('data.category', 'expense')
            ->assertJsonPath('data.amount', 15000);
    }

    public function test_category_must_match_type(): void
    {
        $user = $this->userWithPermission();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'expense',
            'amount' => 10000,
            'description' => 'Salah kategori',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_list_scoped_to_own_transactions_unless_manage_finance(): void
    {
        $user = $this->userWithPermission();
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 100000]);
        $this->actingAs($user, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 10000,
            'description' => 'A',
        ]);

        $other = $this->userWithPermission();
        $this->actingAs($other, 'sanctum')->postJson('/api/v1/shifts', ['opening_balance' => 50000]);
        $this->actingAs($other, 'sanctum')->postJson('/api/v1/cash-transactions', [
            'type' => 'in',
            'category' => 'income',
            'amount' => 20000,
            'description' => 'B',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cash-transactions');
        $response->assertOk()->assertJsonCount(1, 'data');

        Permission::findOrCreate('manage-finance', 'web');
        $user->givePermissionTo('manage-finance');
        $adminResponse = $this->actingAs($user, 'sanctum')->getJson('/api/v1/cash-transactions');
        $adminResponse->assertOk()->assertJsonCount(2, 'data');
    }
}
