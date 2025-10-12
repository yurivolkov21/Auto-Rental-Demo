<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * @method \App\Models\User route(string $param)
 */
class UserUpdateRequest extends FormRequest
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
        $user = $this->route('user');

        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role'          => ['required', 'in:customer,owner,admin'],
            'status'        => ['required', 'in:active,inactive,suspended,banned'],
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
            'email.unique'            => 'This email address is already taken.',
            'date_of_birth.before'    => 'Date of birth must be in the past.',
            'bio.max'                 => 'Biography cannot exceed 500 characters.',
        ];
    }
}
