<?php

namespace App\Repositories\Eloquent;

use App\Models\Setting;
use App\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Support\Collection;

class SettingRepository implements SettingRepositoryInterface
{
    public function allAsMap(): Collection
    {
        return Setting::all()->pluck('value', 'key');
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return Setting::where('key', $key)->value('value') ?? $default;
    }

    public function updateMany(array $data): void
    {
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
