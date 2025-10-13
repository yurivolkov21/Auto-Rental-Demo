<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\DriverProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DriverProfile>
 */
class DriverProfileFactory extends Factory
{
    protected $model = DriverProfile::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'  => User::factory()->driver(), // Will create a user with role='driver'
            'owner_id' => null, // All drivers are platform-managed (no owner assignment)

            // Pricing Configuration
            'hourly_fee'            => fake()->randomFloat(2, 30000, 80000), // 30k - 80k VND/hour
            'daily_fee'             => fake()->randomFloat(2, 300000, 700000), // 300k - 700k VND/day
            'overtime_fee_per_hour' => fake()->randomFloat(2, 10000, 30000), // 10k - 30k overtime
            'daily_hour_threshold'  => fake()->randomElement([8, 10, 12]), // Switch to daily after X hours

            // Availability & Status
            'status' => fake()->randomElement([
                'available',  // 60%
                'available',
                'available',
                'on_duty',    // 20%
                'off_duty',   // 15%
                'suspended',  // 5%
            ]),
            'working_hours' => fake()->boolean(70) // 70% have defined working hours
                ? [
                    'mon' => '8-18',
                    'tue' => '8-18',
                    'wed' => '8-18',
                    'thu' => '8-18',
                    'fri' => '8-18',
                    'sat' => '8-14',
                    'sun' => 'off',
                ]
                : null,
            'is_available_for_booking' => fake()->boolean(85), // 85% available for booking

            // Performance Metrics
            'completed_trips'    => fake()->numberBetween(0, 500),
            'average_rating'     => fake()->optional(0.8)->randomFloat(2, 3.5, 5.0), // 80% have ratings
            'total_km_driven'    => fake()->numberBetween(0, 100000), // 0 - 100k km
            'total_hours_driven' => fake()->numberBetween(0, 5000), // 0 - 5k hours
        ];
    }

    /**
     * Indicate that the driver is available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'available',
            'is_available_for_booking' => true,
        ]);
    }

    /**
     * Indicate that the driver is on duty.
     */
    public function onDuty(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'on_duty',
            'is_available_for_booking' => false,
        ]);
    }

    /**
     * Indicate that the driver is off duty.
     */
    public function offDuty(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'off_duty',
            'is_available_for_booking' => false,
        ]);
    }

    /**
     * Indicate that the driver is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'suspended',
            'is_available_for_booking' => false,
        ]);
    }

    /**
     * Indicate that the driver is highly rated.
     */
    public function topRated(): static
    {
        return $this->state(fn (array $attributes) => [
            'average_rating'  => fake()->randomFloat(2, 4.5, 5.0),
            'completed_trips' => fake()->numberBetween(100, 500),
        ]);
    }
}
