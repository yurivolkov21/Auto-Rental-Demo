<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserVerification;
use Illuminate\Database\Seeder;

class UserVerificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🔐 Starting user verification seeding...');
        $this->command->newLine();

        // Get admin user for verified_by field
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->error('❌ Admin user not found. Please run UserSeeder first.');
            return;
        }

        // Get all users by role (excluding admin)
        $customers = User::where('role', 'customer')->get();
        $owners    = User::where('role', 'owner')->get();
        $drivers   = User::where('role', 'driver')->get();

        // Create verifications for customers (100% verified by admin)
        $this->command->info('👥 Creating verifications for customers...');
        foreach ($customers as $customer) {
            UserVerification::factory()->customer()->create([
                'user_id'     => $customer->id,
                'verified_by' => $admin->id,
                'verified_at' => $customer->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
                'created_at'  => $customer->created_at->copy()->addHours(fake()->numberBetween(2, 24)),
                'updated_at'  => $customer->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
            ]);
        }
        $this->command->info("✅ {$customers->count()} customer verifications created (100% verified)");
        $this->command->newLine();

        // Create verifications for owners (100% verified by admin)
        $this->command->info('🚗 Creating verifications for owners...');
        foreach ($owners as $owner) {
            UserVerification::factory()->owner()->create([
                'user_id'     => $owner->id,
                'verified_by' => $admin->id,
                'verified_at' => $owner->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
                'created_at'  => $owner->created_at->copy()->addHours(fake()->numberBetween(2, 24)),
                'updated_at'  => $owner->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
            ]);
        }
        $this->command->info("✅ {$owners->count()} owner verifications created (100% verified)");
        $this->command->newLine();

        // Create verifications for drivers (100% verified - drivers must be verified to work)
        $this->command->info('🚕 Creating verifications for drivers...');
        foreach ($drivers as $driver) {
            UserVerification::factory()->driver()->create([
                'user_id'     => $driver->id,
                'verified_by' => $admin->id,
                'verified_at' => $driver->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
                'created_at'  => $driver->created_at->copy()->addHours(fake()->numberBetween(2, 24)),
                'updated_at'  => $driver->created_at->copy()->addHours(fake()->numberBetween(24, 72)),
            ]);
        }
        $this->command->info("✅ {$drivers->count()} driver verifications created (100% verified)");
        $this->command->newLine();

        $this->command->info('🎉 User verification seeding completed!');
        $this->command->info("📊 Total verifications: " . UserVerification::count());
        $this->command->info("   - Verified: " . UserVerification::where('status', 'verified')->count());
        $this->command->info("   - Pending: " . UserVerification::where('status', 'pending')->count());
        $this->command->info("   - Rejected: " . UserVerification::where('status', 'rejected')->count());
        $this->command->info("   - Expired: " . UserVerification::where('status', 'expired')->count());
    }
}
