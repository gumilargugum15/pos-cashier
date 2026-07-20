<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SettingControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_view_settings(): void
    {
        $this->getJson('/api/v1/settings')->assertStatus(401);
    }

    public function test_authenticated_user_can_view_default_settings(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/settings');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.currency_name', 'Rupiah')
            ->assertJsonPath('data.currency_code', 'IDR')
            ->assertJsonPath('data.currency_symbol', 'Rp')
            ->assertJsonPath('data.symbol_position', 'front')
            ->assertJsonPath('data.tax_percentage', '11')
            ->assertJsonPath('data.company_name', 'Nova POS')
            ->assertJsonPath('data.timezone', 'Asia/Jakarta')
            ->assertJsonPath('data.receipt_paper_size', '80mm');
    }

    public function test_guest_cannot_update_settings(): void
    {
        $this->putJson('/api/v1/settings', ['tax_percentage' => 10])->assertStatus(401);
    }

    public function test_user_without_permission_cannot_update_settings(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', [
            'tax_percentage' => 10,
        ]);

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_update_settings(): void
    {
        Permission::findOrCreate('manage-settings', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', [
            'tax_percentage' => 10,
            'company_name' => 'Toko Makmur Jaya',
            'company_address' => 'Jl. Merdeka No. 1',
            'company_phone' => '021-5551234',
            'company_email' => 'toko@makmurjaya.test',
            'timezone' => 'Asia/Makassar',
            'receipt_paper_size' => '58mm',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.tax_percentage', '10')
            ->assertJsonPath('data.company_name', 'Toko Makmur Jaya')
            ->assertJsonPath('data.company_address', 'Jl. Merdeka No. 1')
            ->assertJsonPath('data.company_phone', '021-5551234')
            ->assertJsonPath('data.company_email', 'toko@makmurjaya.test')
            ->assertJsonPath('data.timezone', 'Asia/Makassar')
            ->assertJsonPath('data.receipt_paper_size', '58mm');

        $this->assertDatabaseHas('settings', ['key' => 'tax_percentage', 'value' => '10']);
        $this->assertDatabaseHas('settings', ['key' => 'company_name', 'value' => 'Toko Makmur Jaya']);
    }

    public function test_update_fails_with_invalid_receipt_paper_size(): void
    {
        Permission::findOrCreate('manage-settings', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', [
            'receipt_paper_size' => '110mm',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_update_fails_with_invalid_email(): void
    {
        Permission::findOrCreate('manage-settings', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', [
            'company_email' => 'not-an-email',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_partial_update_preserves_other_settings(): void
    {
        Permission::findOrCreate('manage-settings', 'web');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-settings');

        $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', ['tax_percentage' => 8]);
        $response = $this->actingAs($user, 'sanctum')->putJson('/api/v1/settings', [
            'company_name' => 'Toko Baru',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.tax_percentage', '8')
            ->assertJsonPath('data.company_name', 'Toko Baru');
    }
}
