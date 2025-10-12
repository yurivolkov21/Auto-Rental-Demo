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
    }
}
