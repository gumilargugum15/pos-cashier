<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
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
            'purchase_number' => $this->purchase_number,
            'supplier' => $this->whenLoaded('supplier', fn () => $this->supplier ? [
                'id' => $this->supplier->id,
                'name' => $this->supplier->name,
            ] : null),
            'creator_name' => $this->whenLoaded('creator', fn () => $this->creator?->name),
            'items' => PurchaseItemResource::collection($this->whenLoaded('items')),
            'status' => $this->status,
            'subtotal' => (float) $this->subtotal,
            'discount_percentage' => (float) $this->discount_percentage,
            'discount_amount' => (float) $this->discount_amount,
            'tax_percentage' => (float) $this->tax_percentage,
            'tax_amount' => (float) $this->tax_amount,
            'grand_total' => (float) $this->grand_total,
            'paid_amount' => (float) $this->paid_amount,
            'remaining_amount' => round((float) $this->grand_total - (float) $this->paid_amount, 2),
            'payment_status' => $this->payment_status,
            'notes' => $this->notes,
            'received_at' => $this->received_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
