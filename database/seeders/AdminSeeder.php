<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Seed only the admin account for initial setup.
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('email', 'admin@autorental.com')->first();
        
        if ($existingAdmin) {
            $this->command->warn('⚠️  Admin account already exists!');
            $this->command->info("📧 Email: admin@autorental.com");
            return;
        }

        // Create admin account
        $admin = User::create([
            'name'              => 'System Administrator',
            'email'             => 'admin@autorental.com',
            'email_verified_at' => now(),
            'password'          => Hash::make('password'),
            'phone'             => '0909123456',
            'address'           => 'Ho Chi Minh City, Vietnam',
            'date_of_birth'     => '1990-01-01',
            'role'              => 'admin',
            'status'            => 'active',
        ]);

        $this->command->info('✅ Admin account created successfully!');
        $this->command->newLine();
        $this->command->info('📧 Email: admin@autorental.com');
        $this->command->info('🔑 Password: password');
        $this->command->newLine();
        $this->command->warn('⚠️  Please change the password after first login!');
    }
}
