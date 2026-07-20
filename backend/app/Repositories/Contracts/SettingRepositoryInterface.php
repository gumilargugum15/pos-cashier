<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface SettingRepositoryInterface
{
    public function allAsMap(): Collection;

    public function get(string $key, mixed $default = null): mixed;

    public function updateMany(array $data): void;
}
