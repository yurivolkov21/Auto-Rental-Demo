<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding cars...');

        // Create cars with different statuses
        Car::factory()->count(50)->available()->create();
        Car::factory()->count(20)->pending()->create();
        Car::factory()->count(10)->maintenance()->create();
        Car::factory()->count(15)->rented()->create();

        $this->command->info('✓ Seeded ' . Car::count() . ' cars');
        $this->command->info('  - Available (verified): ' . Car::where('status', 'available')->where('is_verified', true)->count());
        $this->command->info('  - Pending verification: ' . Car::where('is_verified', false)->count());
        $this->command->info('  - Under maintenance: ' . Car::where('status', 'maintenance')->count());
        $this->command->info('  - Currently rented: ' . Car::where('status', 'rented')->count());
    }
}
