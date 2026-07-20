<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function __construct(
        private readonly ProductRepositoryInterface $products,
    ) {
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->products->paginate($filters);
    }

    public function find(int $id): ?Product
    {
        return $this->products->find($id);
    }

    public function create(array $data, ?UploadedFile $image = null): Product
    {
        if (empty($data['barcode'])) {
            $data['barcode'] = $this->generateUniqueBarcode();
        }

        if ($image) {
            $data['image_path'] = $image->store('products', 'public');
        }

        return $this->products->create($data);
    }

    public function update(Product $product, array $data, ?UploadedFile $image = null): Product
    {
        if ($image) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $image->store('products', 'public');
        }

        return $this->products->update($product, $data);
    }

    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }

    private function generateUniqueBarcode(): string
    {
        do {
            $digits = '';
            for ($i = 0; $i < 12; $i++) {
                $digits .= random_int(0, 9);
            }
            $barcode = $digits.$this->ean13CheckDigit($digits);
        } while ($this->products->barcodeExists($barcode));

        return $barcode;
    }

    private function ean13CheckDigit(string $digits12): string
    {
        $sum = 0;
        foreach (str_split($digits12) as $index => $digit) {
            $sum += (int) $digit * ($index % 2 === 0 ? 1 : 3);
        }
        $mod = $sum % 10;

        return (string) ($mod === 0 ? 0 : 10 - $mod);
    }
}
