<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting database seeding...');
        $this->command->newLine();

        // Seed users (admin, customers, owners, drivers)
        $this->call([
            UserSeeder::class,
            UserVerificationSeeder::class,
            LocationSeeder::class,
            CarCategorySeeder::class,
            CarBrandSeeder::class,
            CarSeeder::class,
            CarImageSeeder::class,
            DriverProfileSeeder::class, // Driver profiles (20 profiles for 20 drivers)
            PromotionSeeder::class,     // Promotions (15 promotions: active, upcoming, archived, paused)
        ]);

        $this->command->newLine();
        $this->command->info('🎉 Database seeding completed successfully!');
    }
}
