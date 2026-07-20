<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'barcode' => $this->barcode,
            'sku' => $this->sku,
            'name' => $this->name,
            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn () => $this->category?->name),
            'brand_id' => $this->brand_id,
            'brand_name' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'unit_id' => $this->unit_id,
            'unit_name' => $this->whenLoaded('unit', fn () => $this->unit?->name),
            'cost_price' => (float) $this->cost_price,
            'price' => (float) $this->price,
            'stock' => $this->stock,
            'min_stock' => $this->min_stock,
            'tax_percentage' => (float) $this->tax_percentage,
            'discount_percentage' => (float) $this->discount_percentage,
            'image_url' => $this->image_path ? asset('storage/'.$this->image_path) : null,
            'is_active' => $this->is_active,
            'is_low_stock' => $this->stock <= $this->min_stock,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
