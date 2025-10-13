<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DriverProfile;
use Illuminate\Database\Seeder;
use App\Models\UserVerification;

class DriverProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚗 Seeding driver profiles...');

        // ============================================
        // STEP 1: Create Test Drivers (Independent)
        // ============================================
        $this->command->info('Creating independent drivers...');

        // Create 5 verified independent drivers with full verification
        $independentDrivers = collect([
            [
                'name'       => 'Nguyen Van An',
                'email'      => 'driver.an@autorental.test',
                'phone'      => '+84901234567',
                'experience' => 8,
                'hourly_fee' => 50000,
                'daily_fee'  => 400000,
                'bio'        => 'Professional driver with 8 years experience in luxury car service. Specialized in airport transfers and long-distance trips.',
            ],
            [
                'name'       => 'Tran Thi Binh',
                'email'      => 'driver.binh@autorental.test',
                'phone'      => '+84901234568',
                'experience' => 5,
                'hourly_fee' => 45000,
                'daily_fee'  => 350000,
                'bio'        => 'Experienced female driver, excellent for family trips and city tours. Fluent in English.',
            ],
            [
                'name'       => 'Le Van Cuong',
                'email'      => 'driver.cuong@autorental.test',
                'phone'      => '+84901234569',
                'experience' => 12,
                'hourly_fee' => 60000,
                'daily_fee'  => 500000,
                'bio'        => 'Senior driver with 12+ years experience. Expert in mountain driving and night trips.',
            ],
            [
                'name'       => 'Pham Thi Dung',
                'email'      => 'driver.dung@autorental.test',
                'phone'      => '+84901234570',
                'experience' => 6,
                'hourly_fee' => 48000,
                'daily_fee'  => 380000,
                'bio'        => 'Friendly and professional driver. Specialized in business travel and corporate clients.',
            ],
            [
                'name'       => 'Hoang Van Em',
                'email'      => 'driver.em@autorental.test',
                'phone'      => '+84901234571',
                'experience' => 10,
                'hourly_fee' => 55000,
                'daily_fee'  => 450000,
                'bio'        => 'Multilingual driver (Vietnamese, English, Chinese). Great for international tourists.',
            ],
        ]);

        foreach ($independentDrivers as $driverData) {
            $user = User::create([
                'name'              => $driverData['name'],
                'email'             => $driverData['email'],
                'password'          => bcrypt('P@ssword123'),
                'email_verified_at' => now(),
                'phone'             => $driverData['phone'],
                'role'              => 'driver',
                'status'            => 'active',
            ]);

            // Create verification record with driver details
            UserVerification::create([
                'user_id'                  => $user->id,
                'driving_license_number'   => 'B2' . fake()->numerify('######'),
                'license_front_image'      => fake()->imageUrl(800, 600, 'business'),
                'license_back_image'       => fake()->imageUrl(800, 600, 'business'),
                'license_type'             => 'B2',
                'license_issue_date'       => now()->subYears($driverData['experience'] + 2),
                'license_expiry_date'      => now()->addYears(5),
                'license_issued_country'   => 'Vietnam',
                'driving_experience_years' => $driverData['experience'],
                'id_card_front_image'      => fake()->imageUrl(800, 600, 'people'),
                'id_card_back_image'       => fake()->imageUrl(800, 600, 'people'),
                'selfie_image'             => fake()->imageUrl(600, 600, 'people'),
                'nationality'              => 'Vietnamese',
                'status'                   => 'verified',
                'verified_by'              => User::where('role', 'admin')->first()?->id,
                'verified_at'              => now()->subDays(rand(7, 30)),
            ]);

            // Create driver profile
            DriverProfile::create([
                'user_id'               => $user->id,
                'owner_id'              => null, // Independent driver
                'hourly_fee'            => $driverData['hourly_fee'],
                'daily_fee'             => $driverData['daily_fee'],
                'overtime_fee_per_hour' => 15000,
                'daily_hour_threshold'  => 10,
                'status'                => 'available',
                'working_hours'         => [
                    'mon' => '6-22',
                    'tue' => '6-22',
                    'wed' => '6-22',
                    'thu' => '6-22',
                    'fri' => '6-22',
                    'sat' => '6-18',
                    'sun' => '8-18',
                ],
                'is_available_for_booking' => true,
                'completed_trips'          => fake()->numberBetween(50, 300),
                'average_rating'           => fake()->randomFloat(2, 4.0, 5.0),
                'total_km_driven'          => fake()->numberBetween(5000, 50000),
                'total_hours_driven'       => fake()->numberBetween(500, 3000),
            ]);

            $this->command->info("✅ Created independent driver: {$driverData['name']}");
        }

        // ============================================
        // STEP 2: Create Drivers for Car Owners
        // ============================================
        $this->command->info('Creating drivers for car owners...');

        $carOwners = User::where('role', 'owner')->get();

        foreach ($carOwners as $owner) {
            // Each owner has 1-3 drivers
            $driverCount = rand(1, 3);

            for ($i = 0; $i < $driverCount; $i++) {
                $user = User::factory()->driver()->create([
                    'email_verified_at' => now(),
                ]);

                // Create verification for driver
                UserVerification::factory()
                    ->forDriver()
                    ->verified()
                    ->create([
                        'user_id' => $user->id,
                    ]);

                // Create driver profile
                DriverProfile::factory()
                    ->employedBy($owner->id)
                    ->create([
                        'user_id' => $user->id,
                    ]);

                $this->command->info("✅ Created driver for owner: {$owner->name}");
            }
        }

        // ============================================
        // STEP 3: Create Random Drivers (Various States)
        // ============================================
        $this->command->info('Creating additional drivers with various states...');

        // 5 available verified drivers
        User::factory()
            ->count(5)
            ->driver()
            ->create()
            ->each(function ($user) {
                UserVerification::factory()
                    ->forDriver()
                    ->verified()
                    ->create(['user_id' => $user->id]);

                DriverProfile::factory()
                    ->available()
                    ->create(['user_id' => $user->id]);
            });

        // 3 drivers on duty
        User::factory()
            ->count(3)
            ->driver()
            ->create()
            ->each(function ($user) {
                UserVerification::factory()
                    ->forDriver()
                    ->verified()
                    ->create(['user_id' => $user->id]);

                DriverProfile::factory()
                    ->onDuty()
                    ->create(['user_id' => $user->id]);
            });

        // 2 drivers off duty
        User::factory()
            ->count(2)
            ->driver()
            ->create()
            ->each(function ($user) {
                UserVerification::factory()
                    ->forDriver()
                    ->verified()
                    ->create(['user_id' => $user->id]);

                DriverProfile::factory()
                    ->offDuty()
                    ->create(['user_id' => $user->id]);
            });

        // 3 pending verification drivers
        User::factory()
            ->count(3)
            ->driver()
            ->create()
            ->each(function ($user) {
                UserVerification::factory()
                    ->forDriver()
                    ->pending()
                    ->create(['user_id' => $user->id]);

                DriverProfile::factory()
                    ->create([
                        'user_id' => $user->id,
                        'is_available_for_booking' => false, // Not available until verified
                    ]);
            });

        $totalDrivers     = DriverProfile::count();
        $availableDrivers = DriverProfile::where('status', 'available')->count();
        $verifiedDrivers  = DriverProfile::whereHas('verification', function ($q) {
            $q->where('status', 'verified');
        })->count();

        $this->command->info("✅ Driver profiles seeded successfully!");
        $this->command->info("📊 Total drivers: {$totalDrivers}");
        $this->command->info("📊 Available drivers: {$availableDrivers}");
        $this->command->info("📊 Verified drivers: {$verifiedDrivers}");
    }
}
