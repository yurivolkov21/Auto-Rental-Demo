<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

class VerificationUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Driving license information
            'driving_license_number'   => ['nullable', 'string', 'max:50'],
            'license_front_image'      => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB - Front side
            'license_back_image'       => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB - Back side
            'license_type'             => ['nullable', 'string', 'in:B1,B2,C,D,E'], // License types
            'license_issue_date'       => ['nullable', 'date', 'before:today'],
            'license_expiry_date'      => ['nullable', 'date', 'after:license_issue_date'],
            'license_issued_country'   => ['nullable', 'string', 'max:100'],
            'driving_experience_years' => ['nullable', 'integer', 'min:0', 'max:50'], // For drivers

            // Identity verification
            'id_card_front_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB - CCCD front
            'id_card_back_image'  => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB - CCCD back
            'selfie_image'        => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB
            'nationality'         => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'license_expiry_date.after'    => 'The expiry date must be after the issue date.',
            'license_front_image.max'      => 'The license front image must not be larger than 5MB.',
            'license_back_image.max'       => 'The license back image must not be larger than 5MB.',
            'id_card_front_image.max'      => 'The ID card front image must not be larger than 5MB.',
            'id_card_back_image.max'       => 'The ID card back image must not be larger than 5MB.',
            'selfie_image.max'             => 'The selfie image must not be larger than 5MB.',
            'driving_experience_years.min' => 'Driving experience years must be at least 0.',
            'driving_experience_years.max' => 'Driving experience years cannot exceed 50 years.',
        ];
    }
}
