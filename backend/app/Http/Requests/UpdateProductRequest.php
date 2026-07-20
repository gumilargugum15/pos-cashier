<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize multipart/form-data string booleans (e.g. "true"/"1") before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'barcode' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:products,barcode,'.$productId],
            'sku' => ['sometimes', 'required', 'string', 'max:100', 'unique:products,sku,'.$productId],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'required', 'integer', 'exists:brands,id'],
            'unit_id' => ['sometimes', 'required', 'integer', 'exists:units,id'],
            'cost_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'min_stock' => ['sometimes', 'integer', 'min:0'],
            'tax_percentage' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'discount_percentage' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'image' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
