<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    private const DEFAULTS = [
        'currency_name' => 'Rupiah',
        'currency_code' => 'IDR',
        'currency_symbol' => 'Rp',
        'symbol_position' => 'front',
        'decimal_digits' => '0',
        'thousand_separator' => '.',
        'decimal_separator' => ',',
        'tax_percentage' => '11',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::DEFAULTS as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
