<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Car selection
            'car_id' => 'required|exists:cars,id',

            // Booking dates
            'pickup_datetime' => 'required|date|after:now',
            'return_datetime' => 'required|date|after:pickup_datetime',

            // Locations
            'pickup_location_id'  => 'required|exists:locations,id',
            'dropoff_location_id' => 'nullable|exists:locations,id',

            // Driver service
            'with_driver'       => 'boolean',
            'driver_profile_id' => 'nullable|required_if:with_driver,true|exists:driver_profiles,id',

            // Delivery service
            'is_delivery'      => 'boolean',
            'delivery_address' => 'nullable|required_if:is_delivery,true|string|max:500',

            // Promotion
            'promotion_code' => 'nullable|string|max:50',

            // Additional info
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'car_id'              => 'car',
            'pickup_datetime'     => 'pickup date and time',
            'return_datetime'     => 'return date and time',
            'pickup_location_id'  => 'pickup location',
            'dropoff_location_id' => 'drop-off location',
            'driver_profile_id'   => 'driver',
            'delivery_address'    => 'delivery address',
            'promotion_code'      => 'promotion code',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'pickup_datetime.after'         => 'Pickup date must be in the future.',
            'return_datetime.after'         => 'Return date must be after pickup date.',
            'driver_profile_id.required_if' => 'Please select a driver when requesting driver service.',
            'delivery_address.required_if'  => 'Please provide a delivery address when requesting delivery service.',
        ];
    }
}
