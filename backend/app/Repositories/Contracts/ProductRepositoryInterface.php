<?php

namespace App\Repositories\Contracts;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface ProductRepositoryInterface
{
    public function countActive(): int;

    public function countLowStock(): int;

    public function lowStock(int $limit): Collection;

    public function topSelling(int $limit, \DateTimeInterface $since): Collection;

    public function paginate(array $filters): LengthAwarePaginator;

    public function find(int $id): ?Product;

    public function barcodeExists(string $barcode): bool;

    public function create(array $data): Product;

    public function update(Product $product, array $data): Product;

    public function delete(Product $product): void;

    public function inventoryReportSummary(): array;
}
