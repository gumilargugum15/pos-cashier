<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('manage-settings');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'currency_name' => ['sometimes', 'string', 'max:50'],
            'currency_code' => ['sometimes', 'string', 'max:10'],
            'currency_symbol' => ['sometimes', 'string', 'max:10'],
            'symbol_position' => ['sometimes', 'in:front,back'],
            'decimal_digits' => ['sometimes', 'integer', 'min:0', 'max:2'],
            'thousand_separator' => ['sometimes', 'string', 'max:1'],
            'decimal_separator' => ['sometimes', 'string', 'max:1'],
            'tax_percentage' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'company_name' => ['sometimes', 'string', 'max:255'],
            'company_address' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'company_phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'company_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'timezone' => ['sometimes', 'string', 'max:100'],
            'receipt_paper_size' => ['sometimes', 'in:58mm,80mm'],
        ];
    }
}
