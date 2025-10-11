<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * @method User|null user(string|null $guard = null)
 */
class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            // Profile information
            'avatar'        => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'], // Max 2MB
            'phone'         => ['nullable', 'string', 'max:20', 'regex:/^[\d\s\+\-\(\)]+$/'],
            'bio'           => ['nullable', 'string', 'max:1000'],
            'address'       => ['nullable', 'string', 'max:500'],
            'date_of_birth' => ['nullable', 'date', 'before:today', 'after:1900-01-01'],
        ];
    }
}
