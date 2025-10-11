<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class LocationStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by the 'admin' middleware.
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
            // Basic Information
            'name'        => ['required', 'string', 'max:100'],
            'slug'        => ['nullable', 'string', 'max:255', 'unique:locations,slug'],
            'description' => ['nullable', 'string'],

            // Address Details
            'address' => ['nullable', 'string'],

            // Geographic Coordinates
            'latitude'  => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],

            // Contact Information
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:100'],

            // Operating Hours
            'opening_time' => ['nullable', 'date_format:H:i:s'],
            'closing_time' => ['nullable', 'date_format:H:i:s', 'after:opening_time'],
            'is_24_7'      => ['boolean'],

            // Display & Status
            'is_airport' => ['boolean'],
            'is_popular' => ['boolean'],
            'is_active'  => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name'         => 'location name',
            'slug'         => 'URL slug',
            'description'  => 'description',
            'address'      => 'address',
            'latitude'     => 'latitude',
            'longitude'    => 'longitude',
            'phone'        => 'phone number',
            'email'        => 'email address',
            'opening_time' => 'opening time',
            'closing_time' => 'closing time',
            'is_24_7'      => '24/7 operation',
            'is_airport'   => 'airport location',
            'is_popular'   => 'popular location',
            'is_active'    => 'active status',
            'sort_order'   => 'sort order',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'         => 'The location name is required.',
            'name.max'              => 'The location name must not exceed 100 characters.',
            'slug.unique'           => 'This URL slug is already taken.',
            'latitude.between'      => 'Latitude must be between -90 and 90.',
            'longitude.between'     => 'Longitude must be between -180 and 180.',
            'email.email'           => 'Please provide a valid email address.',
            'closing_time.after'    => 'Closing time must be after opening time.',
            'opening_time.date_format' => 'Opening time must be in HH:MM:SS format.',
            'closing_time.date_format' => 'Closing time must be in HH:MM:SS format.',
        ];
    }
}
