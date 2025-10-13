<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class DriverProfileUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();

        return $user instanceof User && $user->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Pricing Configuration
            'hourly_fee'            => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'daily_fee'             => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'overtime_fee_per_hour' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'daily_hour_threshold'  => ['required', 'integer', 'min:1', 'max:24'],

            // Availability & Status
            'status'                   => ['required', 'in:available,on_duty,off_duty,suspended'],
            'is_available_for_booking' => ['required', 'boolean'],
            'working_hours'            => ['nullable', 'array'],
            'working_hours.monday'     => ['nullable', 'string', 'max:50'],
            'working_hours.tuesday'    => ['nullable', 'string', 'max:50'],
            'working_hours.wednesday'  => ['nullable', 'string', 'max:50'],
            'working_hours.thursday'   => ['nullable', 'string', 'max:50'],
            'working_hours.friday'     => ['nullable', 'string', 'max:50'],
            'working_hours.saturday'   => ['nullable', 'string', 'max:50'],
            'working_hours.sunday'     => ['nullable', 'string', 'max:50'],

            // Owner Assignment
            'owner_id' => ['nullable', 'exists:users,id'],
        ];
    }

    /**
     * Get custom attribute names for validation errors.
     */
    public function attributes(): array
    {
        return [
            'hourly_fee'                => 'hourly fee',
            'daily_fee'                 => 'daily fee',
            'overtime_fee_per_hour'     => 'overtime fee per hour',
            'daily_hour_threshold'      => 'daily hour threshold',
            'is_available_for_booking'  => 'booking availability',
            'working_hours.monday'      => 'Monday working hours',
            'working_hours.tuesday'     => 'Tuesday working hours',
            'working_hours.wednesday'   => 'Wednesday working hours',
            'working_hours.thursday'    => 'Thursday working hours',
            'working_hours.friday'      => 'Friday working hours',
            'working_hours.saturday'    => 'Saturday working hours',
            'working_hours.sunday'      => 'Sunday working hours',
            'owner_id'                  => 'car owner',
        ];
    }
}
