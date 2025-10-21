<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Calculate date range (6 months ago to now)
        $endDate   = Carbon::now();
        $startDate = $endDate->copy()->subMonths(6);

        // Create admin user (unique, always exists)
        $admin = User::factory()->admin()->create([
            'name'              => 'Admin User',
            'email'             => 'laravel.carbook.app@gmail.com',
            'role'              => 'admin',
            'email_verified_at' => $startDate->copy(), // Admin created 6 months ago
            'created_at'        => $startDate->copy(),
            'updated_at'        => $startDate->copy(),
        ]);

        $this->command->info("✅ Admin created: {$admin->email} / password");
        $this->command->newLine();

        // Create 50 customers (international tourists)
        $this->command->info('👥 Creating 50 customers (international tourists)...');
        $totalCustomers = 50;
        $this->createUsersWithDistributedDates($totalCustomers, 'customer', $startDate, $endDate);
        $this->command->info("✅ {$totalCustomers} customers created");
        $this->command->newLine();

        // Create 20 owners (Vietnamese car owners)
        $this->command->info('🚗 Creating 20 owners (Vietnamese car owners)...');
        $totalOwners = 20;
        $this->createUsersWithDistributedDates($totalOwners, 'owner', $startDate, $endDate);
        $this->command->info("✅ {$totalOwners} owners created");
        $this->command->newLine();

        // Create 20 drivers (Vietnamese drivers)
        $this->command->info('🚕 Creating 20 drivers (Vietnamese drivers)...');
        $totalDrivers = 20;
        $this->createUsersWithDistributedDates($totalDrivers, 'driver', $startDate, $endDate);
        $this->command->info("✅ {$totalDrivers} drivers created");
        $this->command->newLine();

        $this->command->info('🎉 User seeding completed!');
        $this->command->info("📊 Total users: " . User::count());
        $this->command->info("   - Admins: " . User::where('role', 'admin')->count());
        $this->command->info("   - Customers: " . User::where('role', 'customer')->count());
        $this->command->info("   - Owners: " . User::where('role', 'owner')->count());
        $this->command->info("   - Drivers: " . User::where('role', 'driver')->count());
    }

    /**
     * Create users with evenly distributed dates across a date range.
     *
     * @param int $count Number of users to create
     * @param string $role User role (customer, owner, driver)
     * @param Carbon $startDate Start date for distribution
     * @param Carbon $endDate End date for distribution
     */
    private function createUsersWithDistributedDates(int $count, string $role, Carbon $startDate, Carbon $endDate): void
    {
        // Calculate interval in seconds between each user
        $totalSeconds    = $endDate->diffInSeconds($startDate);
        $intervalSeconds = $totalSeconds / $count;

        for ($i = 0; $i < $count; $i++) {
            // Calculate creation date for this user (evenly distributed)
            $createdAt = $startDate->copy()->addSeconds($intervalSeconds * $i);

            // Email verified 1-48 hours after account creation
            $emailVerifiedAt = $createdAt->copy()->addHours(fake()->numberBetween(1, 48));

            // Create user with factory state
            User::factory()->{$role}()->create([
                'email_verified_at' => $emailVerifiedAt,
                'created_at'        => $createdAt,
                'updated_at'        => $createdAt->copy()->addDays(fake()->numberBetween(0, 30)),
            ]);
        }
    }
}
