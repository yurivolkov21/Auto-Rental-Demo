<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DriverProfile;
use Illuminate\Database\Seeder;

class DriverProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates driver profiles for all users with role='driver'.
     * Some drivers are employed by car owners, others are independent.
     */
    public function run(): void
    {
        $this->command->info('🚕 Starting driver profile seeding...');

        // Get all driver users
        $drivers = User::where('role', 'driver')->get();

        if ($drivers->isEmpty()) {
            $this->command->warn('⚠️  No drivers found. Please run UserSeeder first.');
            return;
        }

        // Get all owners (for employed drivers)
        $owners = User::where('role', 'owner')->pluck('id')->toArray();

        if (empty($owners)) {
            $this->command->warn('⚠️  No owners found. All drivers will be independent.');
        }

        $totalProfiles    = 0;
        $employedCount    = 0;
        $independentCount = 0;

        foreach ($drivers as $driver) {
            // 50% chance driver is employed by a car owner, 50% independent
            $isEmployed = !empty($owners) && fake()->boolean(50);

            $dailyFee   = round(fake()->numberBetween(300, 500) * 1000); // 300k-500k VND/day
            $hourlyFee  = round($dailyFee / 24 * 1.2 / 1000) * 1000; // Hourly = Daily/24 * 1.2

            DriverProfile::create([
                'user_id'                    => $driver->id,
                'owner_id'                   => $isEmployed ? fake()->randomElement($owners) : null,
                'hourly_fee'                 => $hourlyFee,
                'daily_fee'                  => $dailyFee,
                'overtime_fee_per_hour'      => $hourlyFee + round(fake()->numberBetween(10, 20) * 1000),
                'daily_hour_threshold'       => 24,
                'status'                     => 'available', // 100% available
                'working_hours'              => $this->generateWorkingHours(),
                'is_available_for_booking'   => true, // 100% available for booking
                'completed_trips'            => fake()->numberBetween(10, 200),
                'average_rating'             => fake()->randomFloat(2, 4.0, 5.0),
                'total_km_driven'            => fake()->numberBetween(5000, 50000),
                'total_hours_driven'         => fake()->numberBetween(500, 5000),
            ]);

            if ($isEmployed) {
                $employedCount++;
            } else {
                $independentCount++;
            }

            $totalProfiles++;
        }

        $this->command->info("✅ {$totalProfiles} driver profiles created");
        $this->command->info("   - Employed drivers: {$employedCount}");
        $this->command->info("   - Independent drivers: {$independentCount}");
        $this->command->newLine();
        $this->command->info('🎉 Driver profile seeding completed!');
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
}
