<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            SettingSeeder::class,
        ]);

        User::factory()->count(4)->create()->each(
            fn (User $user) => $user->assignRole('Kasir'),
        );

        Branch::factory()->count(3)->create();
        Warehouse::factory()->count(2)->create();

        $categories = Category::factory()->count(8)->create();
        $brands = Brand::factory()->count(10)->create();
        $units = Unit::factory()->count(5)->create();

        Product::factory()
            ->count(40)
            ->recycle($categories)
            ->recycle($brands)
            ->recycle($units)
            ->create();

        Customer::factory()->count(20)->create();

        $this->call(SaleSeeder::class);
    }
}
