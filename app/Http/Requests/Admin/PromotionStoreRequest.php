<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PromotionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Relies on middleware
    }

    public function rules(): array
    {
        return [
            'code'              => ['required', 'string', 'max:20', 'unique:promotions,code'],
            'name'              => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'discount_type'     => ['required', 'in:percentage,fixed_amount'],
            'discount_value'    => ['required', 'numeric', 'min:0', 'max:100000000'],
            'max_discount'      => ['nullable', 'numeric', 'min:0'],
            'min_amount'        => ['nullable', 'numeric', 'min:0'],
            'min_rental_hours'  => ['nullable', 'integer', 'min:1'],
            'max_uses'          => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'start_date'        => ['required', 'date'],
            'end_date'          => ['required', 'date', 'after:start_date'],
            'status'            => ['required', 'in:active,paused,upcoming'],
            'is_auto_apply'     => ['boolean'],
            'is_featured'       => ['boolean'],
            'priority'          => ['nullable', 'integer', 'min:0'],
        ];
    }
}
