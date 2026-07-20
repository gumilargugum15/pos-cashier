<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
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
            'reference_number' => $this->reference_number,
            'product' => $this->whenLoaded('product', fn () => $this->product ? [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'sku' => $this->product->sku,
            ] : null),
            'type' => $this->type,
            'quantity' => $this->quantity,
            'stock_before' => $this->stock_before,
            'stock_after' => $this->stock_after,
            'warehouse' => $this->whenLoaded('warehouse', fn () => $this->warehouse ? [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name,
            ] : null),
            'from_warehouse' => $this->whenLoaded('fromWarehouse', fn () => $this->fromWarehouse ? [
                'id' => $this->fromWarehouse->id,
                'name' => $this->fromWarehouse->name,
            ] : null),
            'to_warehouse' => $this->whenLoaded('toWarehouse', fn () => $this->toWarehouse ? [
                'id' => $this->toWarehouse->id,
                'name' => $this->toWarehouse->name,
            ] : null),
            'reason' => $this->reason,
            'user_name' => $this->whenLoaded('user', fn () => $this->user?->name),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
