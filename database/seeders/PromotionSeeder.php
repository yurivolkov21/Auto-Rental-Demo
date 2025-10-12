<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Seed promotions data.
     */
    public function run(): void
    {
        $adminUser = User::where('role', 'admin')->first();

        // 1. Featured Active Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->active()
            ->featured()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 2. Auto-apply Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->active()
            ->autoApply()
            ->percentage()
            ->create([
                'created_by'  => $adminUser?->id,
                'is_featured' => true,
                'min_amount'  => 1000000, // 1M VND minimum
            ]);

        // 3. Regular Active Promotions (10 promotions)
        Promotion::factory()
            ->count(10)
            ->active()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 4. Upcoming Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->create([
                'status'     => 'upcoming',
                'start_date' => now()->addDays(5),
                'end_date'   => now()->addDays(35),
                'created_by' => $adminUser?->id,
            ]);

        // 5. Paused Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->create([
                'status'     => 'paused',
                'start_date' => now()->subDays(5),
                'end_date'   => now()->addDays(25),
                'created_by' => $adminUser?->id,
            ]);

        // 6. Expired Promotions (5 promotions) - for testing
        Promotion::factory()
            ->count(5)
            ->expired()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 7. Specific Example Promotions
        Promotion::create([
            'code'              => 'WELCOME10',
            'name'              => 'Welcome New Customer',
            'description'       => 'First rental discount for new customers',
            'discount_type'     => 'percentage',
            'discount_value'    => 10,
            'max_discount'      => 200000,
            'min_amount'        => 500000,
            'min_rental_hours'  => 24,
            'max_uses'          => null, // Unlimited
            'max_uses_per_user' => 1,
            'used_count'        => 0,
            'start_date'        => now()->subDays(10),
            'end_date'          => now()->addMonths(6),
            'status'            => 'active',
            'is_auto_apply'     => false,
            'is_featured'       => true,
            'priority'          => 1,
            'created_by'        => $adminUser?->id,
        ]);

        Promotion::create([
            'code'              => 'WEEKEND50',
            'name'              => 'Weekend Special',
            'description'       => '50,000 VND off for weekend rentals',
            'discount_type'     => 'fixed_amount',
            'discount_value'    => 50000,
            'max_discount'      => null,
            'min_amount'        => 0,
            'min_rental_hours'  => 12,
            'max_uses'          => 500,
            'max_uses_per_user' => 2,
            'used_count'        => 123,
            'start_date'        => now()->subDays(15),
            'end_date'          => now()->addDays(45),
            'status'            => 'active',
            'is_auto_apply'     => true,
            'is_featured'       => true,
            'priority'          => 0, // Highest priority
            'created_by'        => $adminUser?->id,
        ]);

        $this->command->info('✓ Seeded ' . Promotion::count() . ' promotions');
    }
}
