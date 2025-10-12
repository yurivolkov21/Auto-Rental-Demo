<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use App\Models\CarCategory;
use Illuminate\Database\Seeder;

class CarMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Car Brands (Top 10 in Vietnam)
        $brands = [
            ['name' => 'Toyota', 'slug' => 'toyota', 'sort_order' => 1],
            ['name' => 'Honda', 'slug' => 'honda', 'sort_order' => 2],
            ['name' => 'Ford', 'slug' => 'ford', 'sort_order' => 3],
            ['name' => 'Mazda', 'slug' => 'mazda', 'sort_order' => 4],
            ['name' => 'Hyundai', 'slug' => 'hyundai', 'sort_order' => 5],
            ['name' => 'Kia', 'slug' => 'kia', 'sort_order' => 6],
            ['name' => 'Mitsubishi', 'slug' => 'mitsubishi', 'sort_order' => 7],
            ['name' => 'Suzuki', 'slug' => 'suzuki', 'sort_order' => 8],
            ['name' => 'Nissan', 'slug' => 'nissan', 'sort_order' => 9],
            ['name' => 'Chevrolet', 'slug' => 'chevrolet', 'sort_order' => 10],
        ];

        foreach ($brands as $brand) {
            CarBrand::firstOrCreate(
                ['slug' => $brand['slug']],
                array_merge($brand, ['is_active' => true])
            );
        }

        // Seed Car Categories (Standard vehicle types)
        $categories = [
            ['name' => 'Sedan', 'slug' => 'sedan', 'icon' => 'car', 'description' => '4-door passenger car with separate trunk', 'sort_order' => 1],
            ['name' => 'SUV', 'slug' => 'suv', 'icon' => 'truck', 'description' => 'Sport Utility Vehicle with high ground clearance', 'sort_order' => 2],
            ['name' => 'Hatchback', 'slug' => 'hatchback', 'icon' => 'car-side', 'description' => 'Compact car with rear door that swings upward', 'sort_order' => 3],
            ['name' => 'Minivan', 'slug' => 'minivan', 'icon' => 'van', 'description' => '7-9 seater family vehicle', 'sort_order' => 4],
            ['name' => 'Pickup Truck', 'slug' => 'pickup-truck', 'icon' => 'truck-pickup', 'description' => 'Light truck with open cargo area', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            CarCategory::firstOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }

        $this->command->info('✓ Seeded ' . CarBrand::count() . ' car brands');
        $this->command->info('✓ Seeded ' . CarCategory::count() . ' car categories');
    }
}
