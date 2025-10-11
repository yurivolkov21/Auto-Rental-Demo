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
            'driving_license_number'  => ['nullable', 'string', 'max:50'],
            'driving_license_image'   => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB
            'license_type'            => ['nullable', 'string', 'max:20'],
            'license_issue_date'      => ['nullable', 'date', 'before:today'],
            'license_expiry_date'     => ['nullable', 'date', 'after:license_issue_date'],
            'license_issued_country'  => ['nullable', 'string', 'max:100'],

            // Identity verification
            'id_image'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB
            'selfie_image'            => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // Max 5MB
            'nationality'             => ['nullable', 'string', 'max:100'],
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
            'license_expiry_date.after' => 'The expiry date must be after the issue date.',
            'driving_license_image.max' => 'The license image must not be larger than 5MB.',
            'id_image.max'              => 'The ID image must not be larger than 5MB.',
            'selfie_image.max'          => 'The selfie image must not be larger than 5MB.',
        ];
    }
}
