<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default admin user for testing
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'laravel.carbook.app@gmail.com',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Admin user created: laravel.carbook.app@gmail.com / password');
        $this->command->info('');
        $this->command->info('All factories and seeders have been removed.');
        $this->command->info('You can now create new seeders with fresh data structure.');
    }
}
