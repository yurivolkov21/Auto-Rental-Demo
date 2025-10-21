<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\User;
use App\Models\CarBrand;
use App\Models\Location;
use App\Models\CarCategory;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚗 Starting car seeding...');
        $this->command->newLine();

        // Get all necessary data
        $owners     = User::where('role', 'owner')->get();
        $categories = CarCategory::all();
        $brands     = CarBrand::all();
        $locations  = Location::all();

        if ($owners->isEmpty() || $categories->isEmpty() || $brands->isEmpty()) {
            $this->command->error('❌ Missing required data. Please seed Users, Categories, and Brands first.');
            return;
        }

        // Define car models by category and brand (realistic Vietnam market)
        $carModels = [
            'Economy' => [
                'VinFast' => ['VF 5 Plus'],
                'Hyundai' => ['Grand i10', 'i10'],
                'Kia'     => ['Morning', 'Soluto'],
                'Toyota'  => ['Wigo'],
                'Suzuki'  => ['Celerio', 'Swift'],
            ],
            'Sedan' => [
                'Toyota'  => ['Vios', 'Corolla Altis', 'Camry'],
                'Honda'   => ['City', 'Civic', 'Accord'],
                'Mazda'   => ['Mazda3', 'Mazda6'],
                'Hyundai' => ['Accent', 'Elantra', 'Sonata'],
                'Kia'     => ['Cerato', 'K3', 'K5'],
            ],
            'SUV' => [
                'Toyota'     => ['Fortuner', 'Rush', 'Raize'],
                'Honda'      => ['CR-V', 'HR-V'],
                'Mazda'      => ['CX-5', 'CX-8', 'CX-30'],
                'Ford'       => ['Everest', 'Territory', 'Explorer'],
                'Hyundai'    => ['Santa Fe', 'Tucson', 'Creta'],
                'Kia'        => ['Sorento', 'Seltos', 'Sportage'],
                'Mitsubishi' => ['Outlander', 'Xpander Cross'],
            ],
            'MPV' => [
                'Toyota'     => ['Innova', 'Avanza', 'Veloz'],
                'Mitsubishi' => ['Xpander'],
                'Suzuki'     => ['Ertiga', 'XL7'],
                'Kia'        => ['Carnival'],
            ],
            'Luxury' => [
                'Mercedes-Benz' => ['C-Class', 'E-Class', 'S-Class'],
                'BMW'           => ['3 Series', '5 Series', '7 Series'],
                'Audi'          => ['A4', 'A6', 'Q5'],
            ],
            'Van' => [
                'Ford'          => ['Transit'],
                'Hyundai'       => ['Solati'],
                'Mercedes-Benz' => ['Sprinter'],
            ],
            'Pickup' => [
                'Ford'       => ['Ranger'],
                'Toyota'     => ['Hilux'],
                'Mitsubishi' => ['Triton'],
                'Nissan'     => ['Navara'],
                'Isuzu'      => ['D-Max'],
                'Chevrolet'  => ['Colorado'],
            ],
            'Electric' => [
                'VinFast' => ['VF 8', 'VF 9', 'VF e34'],
            ],
        ];

        // Distribution plan for 100+ cars
        $distribution = [
            'Economy'  => 15,
            'Sedan'    => 20,
            'SUV'      => 20,
            'MPV'      => 15,
            'Luxury'   => 8,
            'Van'      => 8,
            'Pickup'   => 10,
            'Electric' => 4,
        ];

        $totalCars = 0;

        foreach ($distribution as $categoryName => $count) {
            $category = $categories->firstWhere('name', $categoryName);

            if (!$category) {
                continue;
            }

            $this->command->info("📦 Creating {$count} {$categoryName} cars...");

            for ($i = 0; $i < $count; $i++) {
                // Select random brand that has models in this category
                $availableBrands = $carModels[$categoryName] ?? [];

                if (empty($availableBrands)) {
                    continue;
                }

                $brandName = fake()->randomElement(array_keys($availableBrands));
                $brand = $brands->firstWhere('name', $brandName);

                if (!$brand) {
                    continue;
                }

                // Select random model
                $models = $availableBrands[$brandName];
                $model  = fake()->randomElement($models);

                // Assign owner (distribute evenly)
                $owner = $owners->random();

                // Assign location (distribute evenly)
                $location = $locations->random();

                // Set pricing based on category
                $pricing = $this->getPricingByCategory($categoryName);

                // Determine seats by category
                $seats = $this->getSeatsByCategory($categoryName);

                // Set features based on category
                $features = $this->getFeaturesByCategory($categoryName);

                // Set odometer reading
                $odometerKm = fake()->numberBetween(5000, 100000);

                // Create car
                Car::create([
                    'owner_id'                  => $owner->id,
                    'category_id'               => $category->id,
                    'brand_id'                  => $brand->id,
                    'location_id'               => $location->id,
                    'name'                      => "{$brandName} {$model}",
                    'model'                     => $model,
                    'color'                     => fake()->randomElement(['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Pearl White', 'Midnight Black']),
                    'year'                      => fake()->numberBetween(2018, 2025),
                    'license_plate'             => fake()->unique()->regexify('[0-9]{2}[A-Z]{1}-[0-9]{5}'),
                    'vin'                       => fake()->unique()->regexify('[A-HJ-NPR-Z0-9]{17}'), // Always have VIN (17 chars)
                    'seats'                     => $seats,
                    'transmission'              => fake()->randomElement(['manual', 'automatic']),
                    'fuel_type'                 => $this->getFuelTypeByCategory($categoryName),
                    'odometer_km'               => $odometerKm,
                    'insurance_expiry'          => fake()->dateTimeBetween('+6 months', '+2 years'),
                    'registration_expiry'       => fake()->dateTimeBetween('+6 months', '+2 years'),
                    'last_maintenance_date'     => fake()->dateTimeBetween('-3 months', '-1 week'),
                    'next_maintenance_km'       => $odometerKm + fake()->numberBetween(5000, 10000), // Current km + maintenance interval
                    'is_delivery_available'     => fake()->boolean(85),
                    'status'                    => fake()->randomElement(['available', 'available', 'available', 'available', 'available', 'available', 'available', 'available', 'rented']),
                    'is_verified'               => true,
                    'description'               => "Well-maintained {$brandName} {$model} available for rent. Perfect for {$this->getDescriptionByCategory($categoryName)}. All safety features included.",
                    'features'                  => $features,
                    'hourly_rate'               => $pricing['hourly'],
                    'daily_rate'                => $pricing['daily'],
                    'daily_hour_threshold'      => 24,
                    'deposit_amount'            => $pricing['deposit'],
                    'min_rental_hours'          => 4,
                    'overtime_fee_per_hour'     => $pricing['hourly'] + round(fake()->numberBetween(10, 20) * 1000), // Hourly rate + 10k-20k penalty
                    'delivery_fee_per_km'       => round(fake()->numberBetween(10, 30) * 1000), // 10k-30k VND/km (rounded to thousands)
                    'max_delivery_distance'     => fake()->numberBetween(15, 50),
                    'rental_count'              => fake()->numberBetween(0, 100),
                    'average_rating'            => fake()->randomFloat(2, 4.0, 5.0), // 100% cars have rating (4.0-5.0)
                    'created_at'                => fake()->dateTimeBetween('-6 months', 'now'),
                    'updated_at'                => now(),
                ]);

                $totalCars++;
            }

            $this->command->info("✅ {$count} {$categoryName} cars created");
        }

        $this->command->newLine();
        $this->command->info('🎉 Car seeding completed!');
        $this->command->info("📊 Total cars created: {$totalCars}");
        $this->command->info("   - Available: " . Car::where('status', 'available')->count());
        $this->command->info("   - Rented: " . Car::where('status', 'rented')->count());
        $this->command->info("   - Verified: " . Car::where('is_verified', true)->count());
    }

    /**
     * Get pricing by category.
     */
    private function getPricingByCategory(string $category): array
    {
        $pricing = [
            'Economy'   => ['daily' => round(fake()->numberBetween(400, 600) * 1000), 'deposit' => 2000000],
            'Sedan'     => ['daily' => round(fake()->numberBetween(600, 900) * 1000), 'deposit' => 3000000],
            'SUV'       => ['daily' => round(fake()->numberBetween(900, 1500) * 1000), 'deposit' => 5000000],
            'MPV'       => ['daily' => round(fake()->numberBetween(700, 1200) * 1000), 'deposit' => 4000000],
            'Luxury'    => ['daily' => round(fake()->numberBetween(2000, 5000) * 1000), 'deposit' => 10000000],
            'Van'       => ['daily' => round(fake()->numberBetween(1200, 2000) * 1000), 'deposit' => 6000000],
            'Pickup'    => ['daily' => round(fake()->numberBetween(800, 1500) * 1000), 'deposit' => 5000000],
            'Electric'  => ['daily' => round(fake()->numberBetween(1000, 2500) * 1000), 'deposit' => 7000000],
        ];

        $rates = $pricing[$category] ?? ['daily' => 800000, 'deposit' => 3000000];
        $rates['hourly'] = round($rates['daily'] / 24 * 1.2 / 1000) * 1000;

        return $rates;
    }

    /**
     * Get seats by category.
     */
    private function getSeatsByCategory(string $category): int
    {
        return match ($category) {
            'Economy'  => fake()->randomElement([4, 5]),
            'Sedan'    => 5,
            'SUV'      => fake()->randomElement([5, 7]),
            'MPV'      => 7,
            'Luxury'   => 5,
            'Van'      => fake()->randomElement([9, 12, 16]),
            'Pickup'   => fake()->randomElement([5, 6]),
            'Electric' => fake()->randomElement([5, 7]),
            default    => 5,
        };
    }

    /**
     * Get fuel type by category.
     */
    private function getFuelTypeByCategory(string $category): string
    {
        if ($category === 'Electric') {
            return 'electric';
        }

        return fake()->randomElement(['petrol', 'diesel']);
    }

    /**
     * Get features by category.
     */
    private function getFeaturesByCategory(string $category): array
    {
        $baseFeatures = [
            'air_conditioning' => true,
            'bluetooth'        => true,
            'usb_port'         => true,
        ];

        $categoryFeatures = match ($category) {
            'Luxury' => [
                'leather_seats'   => true,
                'sunroof'         => true,
                'parking_sensors' => true,
                'backup_camera'   => true,
                'cruise_control'  => true,
                'gps'             => true,
            ],
            'SUV', 'MPV' => [
                'backup_camera'   => true,
                'gps'             => fake()->boolean(70),
                'third_row_seats' => $category === 'MPV',
            ],
            'Electric' => [
                'fast_charging'           => true,
                'regenerative_braking'    => true,
                'electric_charging_cable' => true,
            ],
            default => [
                'gps'           => fake()->boolean(50),
                'backup_camera' => fake()->boolean(40),
            ],
        };

        return array_merge($baseFeatures, $categoryFeatures);
    }

    /**
     * Get description by category.
     */
    private function getDescriptionByCategory(string $category): string
    {
        return match ($category) {
            'Economy'  => 'city driving and budget-conscious travelers',
            'Sedan'    => 'business trips, airport transfers, and family outings',
            'SUV'      => 'long trips, mountain roads, and adventure travel',
            'MPV'      => 'family trips and group travel with spacious interior',
            'Luxury'   => 'special occasions, VIP services, and premium comfort',
            'Van'      => 'group tours, corporate events, and large groups',
            'Pickup'   => 'cargo transport, outdoor adventures, and rugged terrain',
            'Electric' => 'eco-friendly travel with modern technology and zero emissions',
            default    => 'comfortable and reliable transportation',
        };
    }
}
