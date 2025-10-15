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
        // ============================================
        // STEP 1: Create Static/Master Data (Locations)
        // ============================================
        $this->call(LocationSeeder::class);

        // ============================================
        // STEP 2: Create Users with Roles
        // ============================================
        $this->call(UserSeeder::class);

        // ============================================
        // STEP 3: Seed Promotions (after users are created)
        // ============================================
        $this->call(PromotionSeeder::class);

        // ============================================
        // STEP 4: Seed Car Master Data (Brands & Categories)
        // ============================================
        $this->call(CarMasterDataSeeder::class);

        // ============================================
        // STEP 5: Seed Cars (after brands, categories, users, locations)
        // ============================================
        $this->call(CarSeeder::class);

        // ============================================
        // STEP 6: Seed Car Images (after cars are created)
        // ============================================
        $this->call(CarImageSeeder::class);

        // ============================================
        // STEP 7: Seed Driver Profiles (after users are created)
        // ============================================
        $this->call(DriverProfileSeeder::class);

        // ============================================
        // STEP 8: Seed Bookings (after cars, users, locations, drivers)
        // ============================================
        $this->call(BookingSeeder::class);

        // ============================================
        // STEP 9: Seed Payments (after bookings and charges)
        // ============================================
        $this->call(PaymentSeeder::class);

        // ============================================
        // STEP 10: Seed Reviews (after bookings are completed)
        // ============================================
        $this->call(ReviewSeeder::class);
    }
}
