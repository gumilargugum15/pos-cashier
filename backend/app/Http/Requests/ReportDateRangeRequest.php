<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReportDateRangeRequest extends FormRequest
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
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ];
    }

    public function from(): Carbon
    {
        $from = $this->validated('from');

        return $from ? Carbon::parse($from)->startOfDay() : Carbon::now()->startOfMonth();
    }

    public function to(): Carbon
    {
        $to = $this->validated('to');

        return $to ? Carbon::parse($to)->endOfDay() : Carbon::now()->endOfDay();
    }
}
