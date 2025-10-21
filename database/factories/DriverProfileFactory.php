<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DriverProfile>
 */
class DriverProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $dailyFee = round(fake()->numberBetween(300, 500) * 1000); // 300k-500k VND/day
        $hourlyFee = round($dailyFee / 24 * 1.2 / 1000) * 1000; // Hourly = Daily/24 * 1.2 (rounded to thousands)

        return [
            'user_id'                    => User::factory(),
            'owner_id'                   => null, // Independent driver by default
            'hourly_fee'                 => $hourlyFee,
            'daily_fee'                  => $dailyFee,
            'overtime_fee_per_hour'      => $hourlyFee + round(fake()->numberBetween(10, 20) * 1000), // Hourly + 10k-20k
            'daily_hour_threshold'       => 24,
            'status'                     => 'available', // 100% available
            'working_hours'              => $this->generateWorkingHours(),
            'is_available_for_booking'   => true, // 100% available for booking
            'completed_trips'            => fake()->numberBetween(10, 200),
            'average_rating'             => fake()->randomFloat(2, 4.0, 5.0), // 4.0-5.0 rating
            'total_km_driven'            => fake()->numberBetween(5000, 50000),
            'total_hours_driven'         => fake()->numberBetween(500, 5000),
        ];
    }

    /**
     * Generate working hours schedule.
     */
    private function generateWorkingHours(): array
    {
        // Most drivers work Monday-Saturday, some work Sunday
        $schedule = [
            'mon' => '08:00-18:00',
            'tue' => '08:00-18:00',
            'wed' => '08:00-18:00',
            'thu' => '08:00-18:00',
            'fri' => '08:00-18:00',
            'sat' => fake()->randomElement(['08:00-18:00', '08:00-12:00']),
            'sun' => fake()->randomElement(['off', '08:00-12:00', '08:00-18:00']),
        ];

        return $schedule;
    }

    /**
     * State for available driver.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'available',
            'is_available_for_booking' => true,
        ]);
    }

    /**
     * State for driver on duty.
     */
    public function onDuty(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'on_duty',
            'is_available_for_booking' => false,
        ]);
    }

    /**
     * State for driver off duty.
     */
    public function offDuty(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                   => 'off_duty',
            'is_available_for_booking' => false,
        ]);
    }

    /**
     * State for employed driver (has owner).
     */
    public function employed(): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_id' => User::where('role', 'owner')->inRandomOrder()->first()?->id,
        ]);
    }

    /**
     * State for independent driver (no owner).
     */
    public function independent(): static
    {
        return $this->state(fn (array $attributes) => [
            'owner_id' => null,
        ]);
    }
}
