<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    private const ROLES = ['Admin', 'Owner', 'Manager', 'Supervisor', 'Kasir', 'Gudang'];

    private const PERMISSIONS = [
        'manage-settings',
        'manage-users',
        'manage-products',
        'manage-customers',
        'manage-suppliers',
        'manage-sales',
        'manage-purchases',
        'manage-inventory',
        'manage-finance',
        'view-reports',
        'operate-cash-drawer',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission);
        }

        foreach (self::ROLES as $roleName) {
            Role::findOrCreate($roleName);
        }

        Role::findByName('Admin')->givePermissionTo(self::PERMISSIONS);
        Role::findByName('Owner')->givePermissionTo(self::PERMISSIONS);
        Role::findByName('Kasir')->givePermissionTo(['manage-sales', 'operate-cash-drawer']);
        Role::findByName('Gudang')->givePermissionTo(['manage-inventory']);
        Role::findByName('Manager')->givePermissionTo(['view-reports']);
        Role::findByName('Supervisor')->givePermissionTo(['view-reports']);

        $admin = User::updateOrCreate(
            ['email' => 'admin@novapos.test'],
            [
                'name' => 'Admin Nova POS',
                'password' => bcrypt('password'),
                'is_active' => true,
            ],
        );

        $admin->syncRoles(['Admin']);
    }
}
