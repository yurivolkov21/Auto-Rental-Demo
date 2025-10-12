<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'      => ['required', 'string', 'min:8', 'confirmed'],
            'role'          => ['required', 'in:customer,owner,admin'],
            'status'        => ['required', 'in:active,inactive'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'address'       => ['nullable', 'string'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'bio'           => ['nullable', 'string', 'max:500'],
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
            'email.unique'            => 'This email address is already registered.',
            'password.min'            => 'Password must be at least 8 characters.',
            'password.confirmed'      => 'Password confirmation does not match.',
            'date_of_birth.before'    => 'Date of birth must be in the past.',
            'bio.max'                 => 'Biography cannot exceed 500 characters.',
        ];
    }
}
