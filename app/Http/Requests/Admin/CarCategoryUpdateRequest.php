<?php

namespace App\Http\Requests\Admin;

use App\Models\CarCategory;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @method CarCategory route(string $param)
 */
class CarCategoryUpdateRequest extends FormRequest
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
        $carCategoryId = $this->route('carCategory')->id;

        return [
            'name'        => ['required', 'string', 'max:100'],
            'slug'        => ['nullable', 'string', 'max:150', Rule::unique('car_categories', 'slug')->ignore($carCategoryId)],
            'icon'        => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active'   => ['boolean'],
            'sort_order'  => ['nullable', 'integer', 'min:0', 'max:65535'],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name'        => 'category name',
            'slug'        => 'URL slug',
            'icon'        => 'icon class',
            'description' => 'description',
            'is_active'   => 'active status',
            'sort_order'  => 'sort order',
        ];
    }
}
