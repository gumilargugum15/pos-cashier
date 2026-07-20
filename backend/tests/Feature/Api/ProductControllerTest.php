<?php

namespace Tests\Feature\Api;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    private function userWithPermission(): User
    {
        Permission::findOrCreate('manage-products');
        $user = User::factory()->create();
        $user->givePermissionTo('manage-products');

        return $user;
    }

    private function baseProductPayload(): array
    {
        return [
            'sku' => 'SKU-TEST-001',
            'name' => 'Test Product',
            'category_id' => Category::factory()->create()->id,
            'brand_id' => Brand::factory()->create()->id,
            'unit_id' => Unit::factory()->create()->id,
            'cost_price' => 10000,
            'price' => 15000,
        ];
    }

    public function test_guest_cannot_list_products(): void
    {
        $this->getJson('/api/v1/products')->assertStatus(401);
    }

    public function test_authenticated_user_can_list_products(): void
    {
        $user = User::factory()->create();
        Product::factory()->count(3)->create();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_list_can_be_searched(): void
    {
        $user = User::factory()->create();
        Product::factory()->create(['name' => 'Espresso Beans', 'sku' => 'BEV-001']);
        Product::factory()->create(['name' => 'Whole Milk', 'sku' => 'GRC-002']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products?search=Espresso');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Espresso Beans');
    }

    public function test_list_can_be_filtered_by_category(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);
        Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->getJson("/api/v1/products?category_id={$category->id}");

        $response->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_list_can_be_filtered_by_low_stock(): void
    {
        $user = User::factory()->create();
        Product::factory()->create(['stock' => 2, 'min_stock' => 10]);
        Product::factory()->create(['stock' => 100, 'min_stock' => 10]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products?low_stock=1');

        $response->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_low_stock', true);
    }

    public function test_user_without_permission_cannot_create_product(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', $this->baseProductPayload());

        $response->assertStatus(403);
    }

    public function test_user_with_permission_can_create_product_with_auto_generated_barcode(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', $this->baseProductPayload());

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Test Product')
            ->assertJsonPath('data.is_active', true);

        $barcode = $response->json('data.barcode');
        $this->assertNotEmpty($barcode);
        $this->assertSame(13, strlen($barcode));
        $this->assertDatabaseHas('products', ['sku' => 'SKU-TEST-001', 'barcode' => $barcode]);
    }

    public function test_user_with_permission_can_create_product_with_explicit_barcode(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', array_merge(
            $this->baseProductPayload(),
            ['barcode' => '1234567890123'],
        ));

        $response->assertStatus(201)->assertJsonPath('data.barcode', '1234567890123');
    }

    public function test_create_fails_validation_without_required_fields(): void
    {
        $user = $this->userWithPermission();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', []);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_create_fails_validation_with_duplicate_sku(): void
    {
        $user = $this->userWithPermission();
        Product::factory()->create(['sku' => 'DUP-SKU']);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/products', array_merge(
            $this->baseProductPayload(),
            ['sku' => 'DUP-SKU'],
        ));

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_user_with_permission_can_upload_product_image(): void
    {
        Storage::fake('public');
        $user = $this->userWithPermission();
        $image = UploadedFile::fake()->image('product.jpg', 200, 200);

        $response = $this->actingAs($user, 'sanctum')->post('/api/v1/products', array_merge(
            $this->baseProductPayload(),
            ['image' => $image],
        ));

        $response->assertStatus(201);
        $imageUrl = $response->json('data.image_url');
        $this->assertNotNull($imageUrl);

        $product = Product::where('sku', 'SKU-TEST-001')->first();
        $this->assertNotNull($product->image_path);
        Storage::disk('public')->assertExists($product->image_path);
    }

    public function test_user_with_permission_can_update_product(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/products/{$product->id}", ['name' => 'New Name']);

        $response->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->assertSame('New Name', $product->fresh()->name);
    }

    public function test_updating_product_image_deletes_old_file(): void
    {
        Storage::fake('public');
        $user = $this->userWithPermission();
        $oldImage = UploadedFile::fake()->image('old.jpg');
        $oldPath = $oldImage->store('products', 'public');
        $product = Product::factory()->create(['image_path' => $oldPath]);

        $newImage = UploadedFile::fake()->image('new.jpg');
        $response = $this->actingAs($user, 'sanctum')->post("/api/v1/products/{$product->id}", [
            '_method' => 'PUT',
            'image' => $newImage,
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($product->fresh()->image_path);
    }

    public function test_user_with_permission_can_delete_product(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/products/{$product->id}");

        $response->assertOk()->assertJsonPath('success', true);
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_deleted_product_does_not_appear_in_list(): void
    {
        $user = $this->userWithPermission();
        $product = Product::factory()->create();
        $product->delete();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/products');

        $response->assertOk()->assertJsonCount(0, 'data');
    }
}
