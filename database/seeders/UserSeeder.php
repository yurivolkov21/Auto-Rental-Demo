<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserVerification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed users data with different roles and statuses.
     */
    public function run(): void
    {
        // 1. Create Admin Users (3 admins)
        $admin = User::firstOrCreate(
            ['email' => 'laravel.carbook.app@gmail.com'],
            [
                'name'              => 'System Administrator',
                'password'          => Hash::make('P@ssword123'),
                'email_verified_at' => now(),
                'role'              => 'admin',
                'status'            => 'active',
                'phone'             => '+84937699061',
                'address'           => '123 Admin Street, District 1, Ho Chi Minh City',
            ]
        );

        // 2. Create Customer Users (50 customers)
        User::factory()
            ->count(50)
            ->customer()
            ->create();

        // 3. Create Owner Users (20 owners)
        User::factory()
            ->count(20)
            ->owner()
            ->create();

        // 4. Create some unverified users (10 users)
        User::factory()
            ->count(10)
            ->customer()
            ->unverified()
            ->create();

        // 5. Create some suspended users (5 users)
        User::factory()
            ->count(5)
            ->customer()
            ->suspended()
            ->create();

        // 6. Create OAuth users (5 users)
        User::factory()
            ->count(3)
            ->customer()
            ->oauth('google')
            ->create();

        // 7. Create test accounts with known credentials
        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'              => 'Test Customer',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'role'              => 'customer',
                'status'            => 'active',
                'phone'             => '+84912345678',
                'address'           => '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
                'date_of_birth'     => '1990-01-15',
            ]
        );

        $owner = User::firstOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name'              => 'Test Owner',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'role'              => 'owner',
                'status'            => 'active',
                'phone'             => '+84923456789',
                'address'           => '456 Le Loi Street, District 3, Ho Chi Minh City',
            ]
        );

        // 8. Create verifications for test users
        UserVerification::firstOrCreate(
            ['user_id' => $customer->id],
            [
                'driving_license_number' => 'B1234567',
                'license_type'           => 'B2',
                'license_issue_date'     => '2020-01-01',
                'license_expiry_date'    => '2030-01-01',
                'license_issued_country' => 'Vietnam',
                'nationality'            => 'Vietnamese',
                'status'                 => 'verified',
                'verified_by'            => $admin->id,
                'verified_at'            => now(),
            ]
        );

        // 9. Create some pending verifications
        $pendingUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(20)
            ->get();

        foreach ($pendingUsers as $user) {
            UserVerification::factory()->pending()->create(['user_id' => $user->id]);
        }

        // 10. Create some verified verifications
        $verifiedUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(30)
            ->get();

        foreach ($verifiedUsers as $user) {
            UserVerification::factory()->verified()->create(['user_id' => $user->id]);
        }

        $this->command->info('✓ Seeded ' . User::count() . ' users');
    }
}
