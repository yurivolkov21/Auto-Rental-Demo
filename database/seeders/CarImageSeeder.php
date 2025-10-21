<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Seeder;

class CarImageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates placeholder images for all cars.
     * These can be replaced later with real car photos via admin panel or manual database update.
     */
    public function run(): void
    {
        $this->command->info('🖼️  Starting car image seeding...');

        // Get all cars
        $cars = Car::all();

        if ($cars->isEmpty()) {
            $this->command->warn('⚠️  No cars found. Please run CarSeeder first.');
            return;
        }

        $this->command->info('📸 Using placeholder images (can be replaced with real photos later)');

        $totalImages = 0;

        foreach ($cars as $car) {
            // Number of images per car (3-5 images)
            $imageCount = fake()->numberBetween(3, 5);

            // Generate unique seed based on car ID to get consistent images per car
            $baseSeed = $car->id * 100;

            // Create primary image
            CarImage::create([
                'car_id'      => $car->id,
                'image_path'  => "https://picsum.photos/seed/{$baseSeed}/800/600",
                'alt_text'    => "Primary view of {$car->brand->name} {$car->model}",
                'is_primary'  => true,
                'sort_order'  => 0,
            ]);
            $totalImages++;

            // Create additional gallery images with different seeds
            for ($i = 1; $i < $imageCount; $i++) {
                $seed = $baseSeed + $i;
                CarImage::create([
                    'car_id'      => $car->id,
                    'image_path'  => "https://picsum.photos/seed/{$seed}/800/600",
                    'alt_text'    => "Gallery image {$i} of {$car->brand->name} {$car->model}",
                    'is_primary'  => false,
                    'sort_order'  => $i,
                ]);
                $totalImages++;
            }
        }

        $this->command->info("✅ {$totalImages} placeholder images created for {$cars->count()} cars");
        $this->command->info("📊 Average images per car: " . round($totalImages / $cars->count(), 2));
        $this->command->newLine();
        $this->command->info('💡 Tip: Replace these with real car photos via:');
        $this->command->info('   - Admin panel (upload feature)');
        $this->command->info('   - Manual database update');
        $this->command->info('   - Storage upload + path update');
        $this->command->newLine();
        $this->command->info('🎉 Car image seeding completed!');
    }
}
