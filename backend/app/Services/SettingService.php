<?php

namespace App\Services;

use App\Repositories\Contracts\SettingRepositoryInterface;

class SettingService
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
        'company_name' => 'Nova POS',
        'company_address' => '',
        'company_phone' => '',
        'company_email' => '',
        'timezone' => 'Asia/Jakarta',
        'receipt_paper_size' => '80mm',
    ];

    public function __construct(
        private readonly SettingRepositoryInterface $settings,
    ) {
    }

    public function all(): array
    {
        $stored = $this->settings->allAsMap();

        return collect(self::DEFAULTS)
            ->merge($stored)
            ->toArray();
    }

    public function update(array $data): array
    {
        $this->settings->updateMany($data);

        return $this->all();
    }
}
