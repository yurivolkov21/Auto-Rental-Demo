<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use App\Models\Booking;
use App\Models\Location;
use App\Models\DriverProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        // Get related models
        $customer = User::where('role', 'customer')->inRandomOrder()->first()
                    ?? User::factory()->customer()->create();

        $car = Car::where('status', 'available')->inRandomOrder()->first()
               ?? Car::factory()->create();

        $owner = $car->owner;

        $pickupLocation = Location::inRandomOrder()->first()
                          ?? Location::factory()->create();

        $returnLocation = fake()->boolean(70)
                          ? $pickupLocation
                          : (Location::inRandomOrder()->first() ?? Location::factory()->create());

        // Rental period
        $pickupDatetime = fake()->dateTimeBetween('-1 month', '+2 months');
        $rentalDays     = fake()->numberBetween(1, 7);
        $rentalHours    = fake()->numberBetween(0, 23);
        $returnDatetime = (clone $pickupDatetime)->modify("+{$rentalDays} days {$rentalHours} hours");

        // Driver service
        $withDriver      = fake()->boolean(30); // 30% bookings with driver
        $driverProfile   = null;
        $driverHourlyFee = null;
        $driverDailyFee  = null;

        if ($withDriver) {
            $driverProfile   = DriverProfile::where('status', 'available')->inRandomOrder()->first()
                             ?? DriverProfile::factory()->create();
            $driverHourlyFee = $driverProfile->hourly_fee;
            $driverDailyFee  = $driverProfile->daily_fee;
        }

        // Delivery service
        $isDelivery       = fake()->boolean(40); // 40% bookings with delivery
        $deliveryAddress  = null;
        $deliveryDistance = null;
        $deliveryFeePerKm = null;

        if ($isDelivery && $car->is_delivery_available) {
            $deliveryAddress  = fake()->address();
            $deliveryDistance = fake()->randomFloat(2, 1, 30); // 1-30 km
            $deliveryFeePerKm = $car->delivery_fee_per_km;
        } else {
            $isDelivery = false;
        }

        // Status distribution
        $status = fake()->randomElement([
            'pending'   => 20,  // 20%
            'confirmed' => 30,  // 30%
            'active'    => 10,  // 10%
            'completed' => 30,  // 30%
            'cancelled' => 7,   // 7%
            'rejected'  => 3,   // 3%
        ]);

        // Timestamps based on status
        $confirmedAt = in_array($status, ['confirmed', 'active', 'completed'])
                       ? fake()->dateTimeBetween($pickupDatetime, 'now')
                       : null;

        $cancelledAt = in_array($status, ['cancelled', 'rejected'])
                       ? fake()->dateTimeBetween($pickupDatetime, 'now')
                       : null;

        $actualPickupTime = in_array($status, ['active', 'completed'])
                            ? $pickupDatetime
                            : null;

        $actualReturnTime = $status === 'completed'
                            ? $returnDatetime
                            : null;

        // Admin tracking
        $confirmedBy = $confirmedAt ? (User::where('role', 'admin')->inRandomOrder()->first() ?? null) : null;
        $cancelledBy = $cancelledAt ? ($status === 'rejected' ? $confirmedBy : $customer->id) : null;

        return [
            'booking_code'         => $this->generateBookingCode(),
            'user_id'              => $customer->id,
            'owner_id'             => $owner->id,
            'car_id'               => $car->id,
            'confirmed_by'         => $confirmedBy?->id,
            'cancelled_by'         => $cancelledBy,
            'pickup_location_id'   => $pickupLocation->id,
            'return_location_id'   => $returnLocation->id,
            'pickup_datetime'      => $pickupDatetime,
            'return_datetime'      => $returnDatetime,
            'actual_pickup_time'   => $actualPickupTime,
            'actual_return_time'   => $actualReturnTime,

            // Pricing snapshots from Car
            'hourly_rate'          => $car->hourly_rate,
            'daily_rate'           => $car->daily_rate,
            'daily_hour_threshold' => $car->daily_hour_threshold,
            'deposit_amount'       => $car->deposit_amount,

            // Driver service
            'with_driver'          => $withDriver,
            'driver_profile_id'    => $driverProfile?->id,
            'driver_hourly_fee'    => $driverHourlyFee,
            'driver_daily_fee'     => $driverDailyFee,
            'total_driver_hours'   => 0, // Will be updated by charge calculation
            'driver_notes'         => $withDriver ? fake()->optional(0.3)->sentence() : null,

            // Delivery service
            'is_delivery'          => $isDelivery,
            'delivery_address'     => $deliveryAddress,
            'delivery_distance'    => $deliveryDistance,
            'delivery_fee_per_km'  => $deliveryFeePerKm,

            // Status & lifecycle
            'status'               => $status,
            'confirmed_at'         => $confirmedAt,
            'cancelled_at'         => $cancelledAt,

            // Notes
            'special_requests'     => fake()->optional(0.2)->sentence(10),
            'admin_notes'          => $confirmedAt ? fake()->optional(0.3)->sentence() : null,
            'cancellation_reason'  => $cancelledAt ? fake()->sentence() : null,
        ];
    }

    /**
     * Generate unique booking code (BK-YYYY-NNNNNN)
     */
    private function generateBookingCode(): string
    {
        $year   = date('Y');
        $random = str_pad(fake()->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT);
        return "BK-{$year}-{$random}";
    }

    // === STATE METHODS ===

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'              => 'pending',
            'confirmed_at'        => null,
            'cancelled_at'        => null,
            'confirmed_by'        => null,
            'cancelled_by'        => null,
            'actual_pickup_time'  => null,
            'actual_return_time'  => null,
        ]);
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'              => 'confirmed',
            'confirmed_at'        => now()->subDays(fake()->numberBetween(1, 7)),
            'confirmed_by'        => User::where('role', 'admin')->inRandomOrder()->first()?->id,
            'cancelled_at'        => null,
            'cancelled_by'        => null,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'              => 'active',
            'confirmed_at'        => now()->subDays(fake()->numberBetween(2, 10)),
            'confirmed_by'        => User::where('role', 'admin')->inRandomOrder()->first()?->id,
            'actual_pickup_time'  => $attributes['pickup_datetime'],
            'cancelled_at'        => null,
            'cancelled_by'        => null,
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'              => 'completed',
            'confirmed_at'        => now()->subDays(fake()->numberBetween(10, 30)),
            'confirmed_by'        => User::where('role', 'admin')->inRandomOrder()->first()?->id,
            'actual_pickup_time'  => $attributes['pickup_datetime'],
            'actual_return_time'  => $attributes['return_datetime'],
            'cancelled_at'        => null,
            'cancelled_by'        => null,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'               => 'cancelled',
            'cancelled_at'         => now()->subDays(fake()->numberBetween(1, 5)),
            'cancelled_by'         => $attributes['user_id'],
            'cancellation_reason'  => fake()->sentence(),
            'confirmed_at'         => null,
            'confirmed_by'         => null,
            'actual_pickup_time'   => null,
            'actual_return_time'   => null,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'               => 'rejected',
            'cancelled_at'         => now()->subDays(fake()->numberBetween(1, 3)),
            'cancelled_by'         => User::where('role', 'admin')->inRandomOrder()->first()?->id,
            'cancellation_reason'  => fake()->sentence(),
            'confirmed_at'         => null,
            'confirmed_by'         => null,
            'actual_pickup_time'   => null,
            'actual_return_time'   => null,
        ]);
    }

    public function withDriver(): static
    {
        return $this->state(function (array $attributes) {
            $driver = DriverProfile::where('status', 'available')->inRandomOrder()->first()
                      ?? DriverProfile::factory()->create();

            return [
                'with_driver'       => true,
                'driver_profile_id' => $driver->id,
                'driver_hourly_fee' => $driver->hourly_fee,
                'driver_daily_fee'  => $driver->daily_fee,
                'driver_notes'      => fake()->optional(0.5)->sentence(),
            ];
        });
    }

    public function withDelivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_delivery'         => true,
            'delivery_address'    => fake()->address(),
            'delivery_distance'   => fake()->randomFloat(2, 1, 30),
            'delivery_fee_per_km' => fake()->numberBetween(5000, 20000),
        ]);
    }
}
