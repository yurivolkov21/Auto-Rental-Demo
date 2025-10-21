<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\CarBrand;
use App\Models\Location;
use App\Models\CarCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year        = fake()->numberBetween(2015, 2025);
        $odometerKm  = fake()->numberBetween(5000, 150000); // Current odometer reading
        $dailyRate   = round(fake()->numberBetween(400, 2000) * 1000); // 400k-2M VND/day (rounded to thousands)
        $hourlyRate  = round($dailyRate / 24 * 1.2 / 1000) * 1000; // Hourly = Daily/24 * 1.2 (rounded to thousands)

        return [
            'owner_id'                  => User::factory(),
            'category_id'               => CarCategory::factory(),
            'brand_id'                  => CarBrand::factory(),
            'location_id'               => Location::inRandomOrder()->first()?->id,
            'name'                      => null, // Auto-generated from brand + model
            'model'                     => fake()->words(2, true),
            'color'                     => fake()->randomElement(['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray']),
            'year'                      => $year,
            'license_plate'             => fake()->unique()->regexify('[0-9]{2}[A-Z]{1}-[0-9]{5}'),
            'vin'                       => fake()->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'), // Always have VIN (17 chars)
            'seats'                     => fake()->randomElement([4, 5, 7]),
            'transmission'              => fake()->randomElement(['manual', 'automatic']),
            'fuel_type'                 => fake()->randomElement(['petrol', 'diesel', 'electric', 'hybrid']),
            'odometer_km'               => $odometerKm,
            'insurance_expiry'          => fake()->dateTimeBetween('+6 months', '+2 years'),
            'registration_expiry'       => fake()->dateTimeBetween('+6 months', '+2 years'),
            'last_maintenance_date'     => fake()->dateTimeBetween('-3 months', '-1 week'),
            'next_maintenance_km'       => $odometerKm + fake()->numberBetween(5000, 10000), // Current km + maintenance interval
            'is_delivery_available'     => fake()->boolean(80),
            'status'                    => 'available',
            'is_verified'               => true,
            'description'               => fake()->paragraph(),
            'features'                  => [
                'gps'            => fake()->boolean(70),
                'bluetooth'      => fake()->boolean(80),
                'backup_camera'  => fake()->boolean(60),
                'usb_port'       => fake()->boolean(90),
                'aux_input'      => fake()->boolean(70),
                'sunroof'        => fake()->boolean(30),
                'leather_seats'  => fake()->boolean(40),
            ],
            'hourly_rate'               => $hourlyRate,
            'daily_rate'                => $dailyRate,
            'daily_hour_threshold'      => 24,
            'deposit_amount'            => round(fake()->numberBetween(2000, 10000) * 1000), // 2M-10M VND (rounded to thousands)
            'min_rental_hours'          => 4,
            'overtime_fee_per_hour'     => $hourlyRate + round(fake()->numberBetween(10, 20) * 1000), // Hourly rate + 10k-20k penalty
            'delivery_fee_per_km'       => round(fake()->numberBetween(10, 30) * 1000), // 10k-30k VND/km (rounded to thousands)
            'max_delivery_distance'     => fake()->numberBetween(10, 50),
            'rental_count'              => fake()->numberBetween(0, 50),
            'average_rating'            => fake()->randomFloat(2, 3.5, 5.0), // 100% cars have rating (3.5-5.0)
        ];
    }

    /**
     * State for verified car.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }

    /**
     * State for available car.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
        ]);
    }

    /**
     * State for rented car.
     */
    public function rented(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rented',
        ]);
    }

    /**
     * State for car in maintenance.
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'maintenance',
        ]);
    }

    /**
     * State for inactive car.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
