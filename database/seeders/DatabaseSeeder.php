<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\UserVerification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'laravel.carbook.app@gmail.com'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('P@ssword123'),
                'email_verified_at' => now(),
                'role'              => 'admin',
                'status'            => 'active',
                'phone'             => '+84937699061',
            ]
        );

        // Create test customer
        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'              => 'Customer User',
                'password'          => Hash::make('P@ssword123'),
                'email_verified_at' => now(),
                'role'              => 'customer',
                'status'            => 'active',
                'phone'             => '+84912345678',
                'address'           => '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
                'date_of_birth'     => '1990-01-15',
            ]
        );

        // Create verified customer with verification
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

        // Create test car owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name'              => 'Car Owner',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'role'              => 'owner',
                'status'            => 'active',
                'phone'             => '+84923456789',
                'address'           => '456 Le Loi Street, District 3, Ho Chi Minh City',
            ]
        );

        // Create additional test users (50 customers, 20 owners)
        User::factory()->count(50)->customer()->create();
        User::factory()->count(20)->owner()->create();

        // Create some pending verifications
        $pendingUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(20)
            ->get();

        foreach ($pendingUsers as $user) {
            UserVerification::factory()->pending()->create(['user_id' => $user->id]);
        }

        // Create some verified verifications
        $verifiedUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(30)
            ->get();

        foreach ($verifiedUsers as $user) {
            UserVerification::factory()->verified()->create(['user_id' => $user->id]);
        }
    }
}
