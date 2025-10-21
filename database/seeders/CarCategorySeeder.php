<?php

namespace Database\Seeders;

use App\Models\CarCategory;
use Illuminate\Database\Seeder;

class CarCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚗 Starting car category seeding...');
        $this->command->newLine();

        // Define 8 car categories for Vietnam market
        $categories = [
            [
                'name'        => 'Economy',
                'slug'        => 'economy',
                'icon'        => 'car',
                'description' => 'Compact and fuel-efficient cars perfect for city driving and budget-conscious travelers. Ideal for solo trips or couples.',
                'is_active'   => true,
                'sort_order'  => 1,
            ],
            [
                'name'        => 'Sedan',
                'slug'        => 'sedan',
                'icon'        => 'car-side',
                'description' => 'Comfortable 4-5 seater sedans with spacious trunk. Great for business trips, airport transfers, and family outings.',
                'is_active'   => true,
                'sort_order'  => 2,
            ],
            [
                'name'        => 'SUV',
                'slug'        => 'suv',
                'icon'        => 'truck',
                'description' => 'Versatile 5-7 seater SUVs with high ground clearance. Perfect for long trips, mountain roads, and adventure travel.',
                'is_active'   => true,
                'sort_order'  => 3,
            ],
            [
                'name'        => 'MPV',
                'slug'        => 'mpv',
                'icon'        => 'van-shuttle',
                'description' => 'Multi-purpose 7-seater vehicles ideal for family trips and group travel. Spacious interior with flexible seating.',
                'is_active'   => true,
                'sort_order'  => 4,
            ],
            [
                'name'        => 'Luxury',
                'slug'        => 'luxury',
                'icon'        => 'gem',
                'description' => 'Premium vehicles with top-tier comfort and features. Perfect for special occasions, VIP services, and business executives.',
                'is_active'   => true,
                'sort_order'  => 5,
            ],
            [
                'name'        => 'Van',
                'slug'        => 'van',
                'icon'        => 'bus',
                'description' => 'Large passenger vans (9-16 seats) for group tours, corporate events, and airport shuttle services.',
                'is_active'   => true,
                'sort_order'  => 6,
            ],
            [
                'name'        => 'Pickup',
                'slug'        => 'pickup',
                'icon'        => 'truck-pickup',
                'description' => 'Robust pickup trucks ideal for cargo transport, outdoor adventures, and construction sites. 4x4 options available.',
                'is_active'   => true,
                'sort_order'  => 7,
            ],
            [
                'name'        => 'Electric',
                'slug'        => 'electric',
                'icon'        => 'bolt',
                'description' => 'Eco-friendly electric vehicles with zero emissions. Modern technology, quiet operation, and lower running costs.',
                'is_active'   => true,
                'sort_order'  => 8,
            ],
        ];

        foreach ($categories as $categoryData) {
            CarCategory::create($categoryData);
        }

        $this->command->info("✅ {$this->count()} car categories created");
        $this->command->newLine();

        $this->command->info('🎉 Car category seeding completed!');
        $this->command->info("📊 Total categories: " . CarCategory::count());
        $this->command->info("   - Active categories: " . CarCategory::where('is_active', true)->count());
    }

    /**
     * Count total categories.
     */
    private function count(): int
    {
        return 8;
    }
}
