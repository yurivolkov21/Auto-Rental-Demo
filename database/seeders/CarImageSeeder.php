<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Seeder;

class CarImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding car images...');

        $cars = Car::all();
        $totalImages = 0;

        foreach ($cars as $car) {
            // Create 1 primary image
            CarImage::factory()
                ->forCar($car)
                ->primary()
                ->create();

            // Create 3-6 additional images
            $additionalCount = fake()->numberBetween(3, 6);

            for ($i = 1; $i <= $additionalCount; $i++) {
                CarImage::factory()
                    ->forCar($car)
                    ->create(['sort_order' => $i]);
            }

            $totalImages += (1 + $additionalCount);
        }

        $this->command->info('✓ Seeded ' . $totalImages . ' car images for ' . $cars->count() . ' cars');
        $this->command->info('  - Primary images: ' . CarImage::where('is_primary', true)->count());
        $this->command->info('  - Total images: ' . CarImage::count());
    }
}
