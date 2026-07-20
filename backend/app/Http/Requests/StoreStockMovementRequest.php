<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStockMovementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'type' => ['required', 'in:in,out,adjustment,transfer'],
            'quantity' => ['required_if:type,in,out,transfer', 'integer', 'min:1'],
            'new_stock' => ['required_if:type,adjustment', 'integer', 'min:0'],
            'warehouse_id' => ['nullable', 'integer', 'exists:warehouses,id'],
            'from_warehouse_id' => ['required_if:type,transfer', 'integer', 'exists:warehouses,id'],
            'to_warehouse_id' => ['required_if:type,transfer', 'integer', 'exists:warehouses,id'],
            'reason' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
