<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use App\Models\Location;
use App\Models\CarBrand;
use App\Models\CarCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Car>
 */
class CarFactory extends Factory
{
    protected $model = Car::class;

    public function definition(): array
    {
        $brand    = CarBrand::inRandomOrder()->first() ?? CarBrand::factory()->create();
        $category = CarCategory::inRandomOrder()->first() ?? CarCategory::factory()->create();
        $owner    = User::where('role', 'owner')->inRandomOrder()->first() ?? User::factory()->owner()->create();
        $location = Location::inRandomOrder()->first() ?? Location::factory()->create();

        // Vietnamese car models
        $models = [
            'Camry', 'Corolla', 'Vios', 'Fortuner', 'Innova', 'Yaris', 'Rush', // Toyota
            'City', 'Civic', 'CR-V', 'Accord', 'Jazz', 'HR-V', 'Brio',        // Honda
            'CX-5', 'CX-8', 'Mazda3', 'Mazda6', 'BT-50', 'CX-3',             // Mazda
            'Ranger', 'Everest', 'Explorer', 'EcoSport', 'Territory',       // Ford
            'Grand i10', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Kona',        // Hyundai
            'Morning', 'Soluto', 'Cerato', 'Seltos', 'Sorento', 'Sportage',       // Kia
            'VF5', 'VF6', 'VF7', 'VF8', 'VF9', 'Fadil', 'Lux A2.0', 'Lux SA2.0', // VinFast
        ];

        $colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Dark Gray'];

        // Generate rounded prices (Vietnamese currency - multiples of 1,000 or 5,000)
        $hourlyRate       = $this->roundPrice(fake()->numberBetween(50, 300) * 1000); // 50k - 300k
        $dailyRate        = $this->roundPrice($hourlyRate * 8); // Daily = 8 hours equivalent
        $depositAmount    = $this->roundPrice(fake()->numberBetween(2000, 10000) * 1000); // 2M - 10M
        $overtimeFee      = $this->roundPrice($hourlyRate * 1.5); // 1.5x hourly rate
        $deliveryFeePerKm = $this->roundPrice(fake()->optional(0.8)->randomElement([5000, 10000, 15000, 20000])); // 5k, 10k, 15k, 20k

        return [
            'owner_id'      => $owner->id,
            'category_id'   => $category->id,
            'brand_id'      => $brand->id,
            'location_id'   => $location->id,
            'name'          => null, // Auto-generated from brand + model
            'model'         => fake()->randomElement($models),
            'color'         => fake()->randomElement($colors),
            'year'          => fake()->numberBetween(2018, 2024),
            'license_plate' => $this->generateLicensePlate(),
            'vin'           => fake()->optional(0.7)->regexify('[A-HJ-NPR-Z0-9]{17}'),
            'seats'         => fake()->randomElement([4, 5, 7, 9]),

            // Technical Specifications
            'transmission' => fake()->randomElement(['automatic', 'manual']),
            'fuel_type'    => fake()->randomElement(['petrol', 'diesel', 'hybrid', 'electric']),
            'odometer_km'  => fake()->numberBetween(5000, 150000),

            // Documents & Compliance
            'insurance_expiry'    => fake()->dateTimeBetween('now', '+2 years'),
            'registration_expiry' => fake()->dateTimeBetween('now', '+1 year'),

            // Maintenance Tracking
            'last_maintenance_date' => fake()->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'next_maintenance_km'   => fake()->optional(0.7)->numberBetween(160000, 200000),

            // Rental Settings
            'is_delivery_available' => fake()->boolean(85),

            // Status & Verification
            'status'      => 'available',
            'is_verified' => true,

            // Description & Features
            'description'          => fake()->optional(0.8)->paragraph(3),
            'features'             => fake()->optional(0.9)->randomElements([
                // Safety Features
                'backup_camera'         => fake()->boolean(85),
                'dashcam'               => fake()->boolean(70),
                'airbags'               => fake()->boolean(95),
                'abs'                   => fake()->boolean(90),
                'parking_sensors'       => fake()->boolean(75),
                'tire_pressure_monitor' => fake()->boolean(60),
                'collision_warning'     => fake()->boolean(40),
                '360_camera'            => fake()->boolean(30),
                
                // Technology
                'gps'           => fake()->boolean(80),
                'bluetooth'     => fake()->boolean(95),
                'usb_port'      => fake()->boolean(90),
                'etc'           => fake()->boolean(65),
                'apple_carplay' => fake()->boolean(50),
                'android_auto'  => fake()->boolean(50),
                
                // Comfort
                'air_conditioning' => fake()->boolean(98),
                'sunroof'          => fake()->boolean(35),
                'leather_seats'    => fake()->boolean(40),
                'heated_seats'     => fake()->boolean(20),
                'spare_tire'       => fake()->boolean(85),
                'cruise_control'   => fake()->boolean(55),
                'power_windows'    => fake()->boolean(92),
                'keyless_entry'    => fake()->boolean(70),
                
                // Entertainment
                'dvd_screen'    => fake()->boolean(30),
                'premium_sound' => fake()->boolean(45),
                'aux_port'      => fake()->boolean(80),
            ], fake()->numberBetween(8, 18)),

            // Pricing (Hybrid System)
            'hourly_rate'           => $hourlyRate,
            'daily_rate'            => $dailyRate,
            'daily_hour_threshold'  => 10,
            'deposit_amount'        => $depositAmount,
            'min_rental_hours'      => 4,
            'overtime_fee_per_hour' => $overtimeFee,

            // Delivery Configuration
            'delivery_fee_per_km'   => $deliveryFeePerKm,
            'max_delivery_distance' => fake()->optional(0.8)->numberBetween(10, 50),

            // Performance Metrics
            'rental_count'   => fake()->numberBetween(0, 50),
            'average_rating' => fake()->optional(0.7)->randomFloat(2, 3.5, 5.0),
        ];
    }

    /**
     * Generate Vietnamese license plate
     * Format: XX[A-Z]-XXXXX (e.g., 29A-12345, 51B-67890)
     */
    private function generateLicensePlate(): string
    {
        // Vietnamese city codes
        $cityCodes = [
            '29', '30', '31', '32', // Ho Chi Minh area
            '51', '52',            // Danang area
            '59', '60', '61',     // Hanoi area
            '79', '80',          // Binh Duong
            '43',               // Thua Thien Hue
        ];

        $city    = fake()->randomElement($cityCodes);
        $letter  = fake()->randomLetter();
        $numbers = str_pad(fake()->numberBetween(10000, 99999), 5, '0', STR_PAD_LEFT);

        return "{$city}{$letter}-{$numbers}";
    }

    /**
     * Round price to Vietnamese currency standards
     * Rounds to nearest 1,000 or 5,000 VND
     */
    private function roundPrice(float $amount): int
    {
        // Round to nearest 5,000 for amounts over 100,000
        if ($amount >= 100000) {
            return (int) (round($amount / 5000) * 5000);
        }
        
        // Round to nearest 1,000 for smaller amounts
        return (int) (round($amount / 1000) * 1000);
    }

    /**
     * State: Available and verified cars (ready for rent)
     */
    public function available(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'      => 'available',
            'is_verified' => true,
        ]);
    }

    /**
     * State: Currently rented cars
     */
    public function rented(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'      => 'rented',
            'is_verified' => true,
        ]);
    }

    /**
     * State: Cars under maintenance
     */
    public function maintenance(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'      => 'maintenance',
            'is_verified' => true,
        ]);
    }

    /**
     * State: Pending verification from admin
     */
    public function pending(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'      => 'available',
            'is_verified' => false,
        ]);
    }

    /**
     * State: Inactive cars (owner deactivated)
     */
    public function inactive(): static
    {
        return $this->state(fn(array $attributes) => [
            'status'      => 'inactive',
            'is_verified' => true,
        ]);
    }
}
