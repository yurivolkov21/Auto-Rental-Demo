<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use Illuminate\Database\Seeder;

class CarBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🏷️ Starting car brand seeding...');
        $this->command->newLine();

        // Define popular car brands in Vietnam market
        $brands = [
            // Japanese brands (most popular in Vietnam)
            [
                'name'       => 'Toyota',
                'slug'       => 'toyota',
                'logo'       => 'https://placehold.co/200x100/png?text=Toyota',
                'is_active'  => true,
                'sort_order' => 1,
            ],
            [
                'name'       => 'Honda',
                'slug'       => 'honda',
                'logo'       => 'https://placehold.co/200x100/png?text=Honda',
                'is_active'  => true,
                'sort_order' => 2,
            ],
            [
                'name'       => 'Mazda',
                'slug'       => 'mazda',
                'logo'       => 'https://placehold.co/200x100/png?text=Mazda',
                'is_active'  => true,
                'sort_order' => 3,
            ],
            [
                'name'       => 'Mitsubishi',
                'slug'       => 'mitsubishi',
                'logo'       => 'https://placehold.co/200x100/png?text=Mitsubishi',
                'is_active'  => true,
                'sort_order' => 4,
            ],

            // Korean brands (very popular)
            [
                'name'       => 'Hyundai',
                'slug'       => 'hyundai',
                'logo'       => 'https://placehold.co/200x100/png?text=Hyundai',
                'is_active'  => true,
                'sort_order' => 5,
            ],
            [
                'name'       => 'Kia',
                'slug'       => 'kia',
                'logo'       => 'https://placehold.co/200x100/png?text=Kia',
                'is_active'  => true,
                'sort_order' => 6,
            ],

            // American brands
            [
                'name'       => 'Ford',
                'slug'       => 'ford',
                'logo'       => 'https://placehold.co/200x100/png?text=Ford',
                'is_active'  => true,
                'sort_order' => 7,
            ],
            [
                'name'       => 'Chevrolet',
                'slug'       => 'chevrolet',
                'logo'       => 'https://placehold.co/200x100/png?text=Chevrolet',
                'is_active'  => true,
                'sort_order' => 8,
            ],

            // European luxury brands
            [
                'name'       => 'Mercedes-Benz',
                'slug'       => 'mercedes-benz',
                'logo'       => 'https://placehold.co/200x100/png?text=Mercedes-Benz',
                'is_active'  => true,
                'sort_order' => 9,
            ],
            [
                'name'       => 'BMW',
                'slug'       => 'bmw',
                'logo'       => 'https://placehold.co/200x100/png?text=BMW',
                'is_active'  => true,
                'sort_order' => 10,
            ],
            [
                'name'       => 'Audi',
                'slug'       => 'audi',
                'logo'       => 'https://placehold.co/200x100/png?text=Audi',
                'is_active'  => true,
                'sort_order' => 11,
            ],

            // Vietnamese brand
            [
                'name'       => 'VinFast',
                'slug'       => 'vinfast',
                'logo'       => 'https://placehold.co/200x100/png?text=VinFast',
                'is_active'  => true,
                'sort_order' => 12,
            ],

            // Other popular brands
            [
                'name'       => 'Nissan',
                'slug'       => 'nissan',
                'logo'       => 'https://placehold.co/200x100/png?text=Nissan',
                'is_active'  => true,
                'sort_order' => 13,
            ],
            [
                'name'       => 'Suzuki',
                'slug'       => 'suzuki',
                'logo'       => 'https://placehold.co/200x100/png?text=Suzuki',
                'is_active'  => true,
                'sort_order' => 14,
            ],
            [
                'name'       => 'Isuzu',
                'slug'       => 'isuzu',
                'logo'       => 'https://placehold.co/200x100/png?text=Isuzu',
                'is_active'  => true,
                'sort_order' => 15,
            ],
        ];

        foreach ($brands as $brandData) {
            CarBrand::create($brandData);
        }

        $this->command->info("✅ {$this->count()} car brands created");
        $this->command->newLine();

        $this->command->info('🎉 Car brand seeding completed!');
        $this->command->info("📊 Total brands: " . CarBrand::count());
        $this->command->info("   - Active brands: " . CarBrand::where('is_active', true)->count());
    }

    /**
     * Count total brands.
     */
    private function count(): int
    {
        return 15;
    }
}
