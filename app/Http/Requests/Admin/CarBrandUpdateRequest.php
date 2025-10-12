<?php

namespace App\Http\Requests\Admin;

use App\Models\CarBrand;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @method CarBrand route(string $param)
 */
class CarBrandUpdateRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $carBrandId = $this->route('carBrand')->id;

        return [    
            'name'       => ['required', 'string', 'max:100'],
            'slug'       => ['nullable', 'string', 'max:150', Rule::unique('car_brands', 'slug')->ignore($carBrandId)],
            'logo'       => ['nullable', 'string', 'max:500'],
            'is_active'  => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:65535'],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name'       => 'brand name',
            'slug'       => 'URL slug',
            'logo'       => 'brand logo',
            'is_active'  => 'active status',
            'sort_order' => 'sort order',
        ];
    }
}
