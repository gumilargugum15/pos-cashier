<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\SaleItem;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductRepository implements ProductRepositoryInterface
{
    private const SORTABLE = ['name', 'sku', 'price', 'cost_price', 'stock', 'is_active', 'created_at'];

    public function countActive(): int
    {
        return Product::where('is_active', true)->count();
    }

    public function countLowStock(): int
    {
        return Product::whereColumn('stock', '<=', 'min_stock')->count();
    }

    public function lowStock(int $limit): Collection
    {
        return Product::whereColumn('stock', '<=', 'min_stock')
            ->orderBy('stock')
            ->limit($limit)
            ->get();
    }

    public function topSelling(int $limit, \DateTimeInterface $since): Collection
    {
        return SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.status', 'paid')
            ->where('sales.created_at', '>=', $since)
            ->selectRaw('sale_items.product_name as name, SUM(sale_items.qty) as sold')
            ->groupBy('sale_items.product_name')
            ->orderByDesc('sold')
            ->limit($limit)
            ->get();
    }

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Product::query()->with(['category', 'brand', 'unit']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (! empty($filters['low_stock'])) {
            $query->whereColumn('stock', '<=', 'min_stock');
        }

        $sort = in_array($filters['sort'] ?? null, self::SORTABLE, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        return $query->orderBy($sort, $direction)
            ->paginate($filters['per_page'] ?? 15)
            ->withQueryString();
    }

    public function find(int $id): ?Product
    {
        return Product::with(['category', 'brand', 'unit'])->find($id);
    }

    public function barcodeExists(string $barcode): bool
    {
        return Product::where('barcode', $barcode)->exists();
    }

    public function create(array $data): Product
    {
        $product = Product::create($data);

        return $product->fresh(['category', 'brand', 'unit']);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['category', 'brand', 'unit']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function inventoryReportSummary(): array
    {
        $summary = Product::where('is_active', true)->selectRaw('
            COUNT(*) as total_products,
            COALESCE(SUM(stock),0) as total_stock_qty,
            COALESCE(SUM(stock * cost_price),0) as total_stock_value
        ')->first();

        $lowStockCount = Product::where('is_active', true)
            ->whereColumn('stock', '<=', 'min_stock')
            ->count();

        $byCategory = Product::query()
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('products.is_active', true)
            ->selectRaw('categories.name as category,
                COUNT(*) as product_count,
                SUM(products.stock) as stock_qty,
                SUM(products.stock * products.cost_price) as stock_value')
            ->groupBy('categories.name')
            ->orderByDesc('stock_value')
            ->get();

        return [
            'total_products' => (int) $summary->total_products,
            'total_stock_qty' => (int) $summary->total_stock_qty,
            'total_stock_value' => (float) $summary->total_stock_value,
            'low_stock_count' => $lowStockCount,
            'by_category' => $byCategory->map(fn ($r) => [
                'category' => $r->category,
                'product_count' => (int) $r->product_count,
                'stock_qty' => (int) $r->stock_qty,
                'stock_value' => (float) $r->stock_value,
            ])->values(),
        ];
    }
}
