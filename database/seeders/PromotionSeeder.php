<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates 15 promotions with various types, statuses, and discount configurations.
     */
    public function run(): void
    {
        $this->command->info('🎁 Starting promotion seeding...');

        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $this->command->warn('⚠️  No admin found. Promotions will be created without creator.');
        }

        $promotions = [
            // ========== ACTIVE PROMOTIONS (7) ==========

            // 1. Welcome - New User (Percentage)
            [
                'code'                => 'WELCOME10',
                'name'                => 'Welcome New Customer',
                'description'         => 'Get 10% off on your first car rental with us! Start your journey with Auto Rental.',
                'discount_type'       => 'percentage',
                'discount_value'      => 10,
                'max_discount'        => 200000, // Max 200k VND
                'min_amount'          => 0,
                'min_rental_hours'    => 4,
                'max_uses'            => null, // Unlimited
                'max_uses_per_user'   => 1,
                'used_count'          => fake()->numberBetween(50, 150),
                'start_date'          => now()->subDays(30),
                'end_date'            => now()->addDays(60),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => true,
                'priority'            => 1,
                'created_by'          => $admin?->id,
            ],

            // 2. Welcome - New User (Fixed Amount)
            [
                'code'                => 'NEWUSER50K',
                'name'                => 'New User Special',
                'description'         => '50,000 VND discount for first-time renters. No minimum rental required!',
                'discount_type'       => 'fixed_amount',
                'discount_value'      => 50000,
                'max_discount'        => null,
                'min_amount'          => 0,
                'min_rental_hours'    => 4,
                'max_uses'            => 500,
                'max_uses_per_user'   => 1,
                'used_count'          => fake()->numberBetween(100, 300),
                'start_date'          => now()->subDays(20),
                'end_date'            => now()->addDays(70),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => true,
                'priority'            => 2,
                'created_by'          => $admin?->id,
            ],

            // 3. Seasonal - Summer
            [
                'code'                => 'SUMMER25',
                'name'                => 'Summer Adventure 2025',
                'description'         => 'Beat the heat with 25% off on all car rentals this summer! Perfect for beach trips and mountain escapes.',
                'discount_type'       => 'percentage',
                'discount_value'      => 25,
                'max_discount'        => 500000, // Max 500k VND
                'min_amount'          => 500000, // Min 500k rental
                'min_rental_hours'    => 24,
                'max_uses'            => 1000,
                'max_uses_per_user'   => 2,
                'used_count'          => fake()->numberBetween(200, 500),
                'start_date'          => now()->subDays(15),
                'end_date'            => now()->addDays(45),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => true,
                'priority'            => 0,
                'created_by'          => $admin?->id,
            ],

            // 4. Event - Long Weekend
            [
                'code'                => 'LONGWEEKEND',
                'name'                => 'Long Weekend Special',
                'description'         => '15% off for weekend getaways! Valid for rentals starting Friday-Sunday.',
                'discount_type'       => 'percentage',
                'discount_value'      => 15,
                'max_discount'        => 300000,
                'min_amount'          => 300000,
                'min_rental_hours'    => 24,
                'max_uses'            => null,
                'max_uses_per_user'   => 3,
                'used_count'          => fake()->numberBetween(50, 200),
                'start_date'          => now()->subDays(10),
                'end_date'            => now()->addDays(90),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 3,
                'created_by'          => $admin?->id,
            ],

            // 5. Loyalty - Returning Customer
            [
                'code'                => 'LOYAL15',
                'name'                => 'Loyal Customer Reward',
                'description'         => 'Thank you for coming back! Enjoy 15% off on your next rental.',
                'discount_type'       => 'percentage',
                'discount_value'      => 15,
                'max_discount'        => 400000,
                'min_amount'          => 0,
                'min_rental_hours'    => 8,
                'max_uses'            => null,
                'max_uses_per_user'   => 5,
                'used_count'          => fake()->numberBetween(100, 400),
                'start_date'          => now()->subDays(25),
                'end_date'            => now()->addDays(60),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 4,
                'created_by'          => $admin?->id,
            ],

            // 6. Auto-Apply - High Value Rental
            [
                'code'                => 'AUTO100K',
                'name'                => 'Auto Discount 100K',
                'description'         => 'Automatically applied: 100,000 VND off for rentals over 2,000,000 VND.',
                'discount_type'       => 'fixed_amount',
                'discount_value'      => 100000,
                'max_discount'        => null,
                'min_amount'          => 2000000, // Min 2M VND
                'min_rental_hours'    => 24,
                'max_uses'            => null,
                'max_uses_per_user'   => 10,
                'used_count'          => fake()->numberBetween(50, 150),
                'start_date'          => now()->subDays(20),
                'end_date'            => now()->addDays(90),
                'status'              => 'active',
                'is_auto_apply'       => true,
                'is_featured'         => false,
                'priority'            => 8,
                'created_by'          => $admin?->id,
            ],

            // 7. Event - Weekday Discount
            [
                'code'                => 'WEEKDAY50K',
                'name'                => 'Weekday Special',
                'description'         => '50,000 VND off for rentals starting Monday-Thursday. Perfect for business trips!',
                'discount_type'       => 'fixed_amount',
                'discount_value'      => 50000,
                'max_discount'        => null,
                'min_amount'          => 200000,
                'min_rental_hours'    => 8,
                'max_uses'            => null,
                'max_uses_per_user'   => 10,
                'used_count'          => fake()->numberBetween(30, 100),
                'start_date'          => now()->subDays(5),
                'end_date'            => now()->addDays(60),
                'status'              => 'active',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 5,
                'created_by'          => $admin?->id,
            ],

            // ========== UPCOMING PROMOTIONS (3) ==========

            // 8. Seasonal - Tet Holiday 2026
            [
                'code'                => 'TET2026',
                'name'                => 'Tet Nguyen Dan 2026',
                'description'         => 'Celebrate Vietnamese New Year with 25% off! Book early for Tet holiday travels.',
                'discount_type'       => 'percentage',
                'discount_value'      => 25,
                'max_discount'        => 600000,
                'min_amount'          => 800000,
                'min_rental_hours'    => 24,
                'max_uses'            => 500,
                'max_uses_per_user'   => 2,
                'used_count'          => 0,
                'start_date'          => now()->addDays(30), // Starts in November
                'end_date'            => now()->addDays(90),
                'status'              => 'upcoming',
                'is_auto_apply'       => false,
                'is_featured'         => true,
                'priority'            => 0,
                'created_by'          => $admin?->id,
            ],

            // 9. Loyalty - VIP Member
            [
                'code'                => 'VIP20',
                'name'                => 'VIP Member Exclusive',
                'description'         => 'Exclusive 20% discount for our VIP frequent renters. Coming soon!',
                'discount_type'       => 'percentage',
                'discount_value'      => 20,
                'max_discount'        => 500000,
                'min_amount'          => 500000,
                'min_rental_hours'    => 12,
                'max_uses'            => null,
                'max_uses_per_user'   => 10,
                'used_count'          => 0,
                'start_date'          => now()->addDays(15),
                'end_date'            => now()->addDays(120),
                'status'              => 'upcoming',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 2,
                'created_by'          => $admin?->id,
            ],

            // 10. Event - Long Term Rental
            [
                'code'                => 'LONGTERM200K',
                'name'                => 'Long-Term Rental Discount',
                'description'         => '200,000 VND off for rentals 5 days or longer. Perfect for extended trips!',
                'discount_type'       => 'fixed_amount',
                'discount_value'      => 200000,
                'max_discount'        => null,
                'min_amount'          => 1000000,
                'min_rental_hours'    => 120, // 5 days
                'max_uses'            => null,
                'max_uses_per_user'   => 5,
                'used_count'          => 0,
                'start_date'          => now()->addDays(10),
                'end_date'            => now()->addDays(100),
                'status'              => 'upcoming',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 4,
                'created_by'          => $admin?->id,
            ],

            // ========== ARCHIVED PROMOTIONS (3) ==========

            // 11. Old Seasonal - Year End 2024
            [
                'code'                => 'YEAREND24',
                'name'                => 'Year End Sale 2024',
                'description'         => 'Ring in the new year with 20% off! [EXPIRED]',
                'discount_type'       => 'percentage',
                'discount_value'      => 20,
                'max_discount'        => 400000,
                'min_amount'          => 300000,
                'min_rental_hours'    => 12,
                'max_uses'            => 1000,
                'max_uses_per_user'   => 2,
                'used_count'          => fake()->numberBetween(500, 1000),
                'start_date'          => now()->subDays(90),
                'end_date'            => now()->subDays(15),
                'status'              => 'archived',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 5,
                'created_by'          => $admin?->id,
            ],

            // 12. Old Event - Weekend Flash
            [
                'code'                => 'OLDWEEKEND',
                'name'                => 'Weekend Flash Sale',
                'description'         => 'Limited time weekend special. [EXPIRED]',
                'discount_type'       => 'fixed_amount',
                'discount_value'      => 100000,
                'max_discount'        => null,
                'min_amount'          => 500000,
                'min_rental_hours'    => 24,
                'max_uses'            => 200,
                'max_uses_per_user'   => 1,
                'used_count'          => 200, // Maxed out
                'start_date'          => now()->subDays(60),
                'end_date'            => now()->subDays(30),
                'status'              => 'archived',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 6,
                'created_by'          => $admin?->id,
            ],

            // 13. Old Welcome
            [
                'code'                => 'OLDWELCOME',
                'name'                => 'Old Welcome Offer',
                'description'         => 'Previous welcome promotion. [EXPIRED]',
                'discount_type'       => 'percentage',
                'discount_value'      => 15,
                'max_discount'        => 150000,
                'min_amount'          => 0,
                'min_rental_hours'    => 4,
                'max_uses'            => 500,
                'max_uses_per_user'   => 1,
                'used_count'          => fake()->numberBetween(400, 500),
                'start_date'          => now()->subDays(120),
                'end_date'            => now()->subDays(60),
                'status'              => 'archived',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 7,
                'created_by'          => $admin?->id,
            ],

            // ========== PAUSED PROMOTIONS (2) ==========

            // 14. Paused - Flash Sale
            [
                'code'                => 'FLASH20',
                'name'                => 'Flash Sale 20%',
                'description'         => 'Limited time flash sale - temporarily paused.',
                'discount_type'       => 'percentage',
                'discount_value'      => 20,
                'max_discount'        => 300000,
                'min_amount'          => 400000,
                'min_rental_hours'    => 12,
                'max_uses'            => 300,
                'max_uses_per_user'   => 2,
                'used_count'          => fake()->numberBetween(50, 150),
                'start_date'          => now()->subDays(10),
                'end_date'            => now()->addDays(20),
                'status'              => 'paused',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 6,
                'created_by'          => $admin?->id,
            ],

            // 15. Paused - Corporate
            [
                'code'                => 'CORPORATE15',
                'name'                => 'Corporate Partnership',
                'description'         => '15% off for corporate partners - currently under review.',
                'discount_type'       => 'percentage',
                'discount_value'      => 15,
                'max_discount'        => 500000,
                'min_amount'          => 1000000,
                'min_rental_hours'    => 24,
                'max_uses'            => null,
                'max_uses_per_user'   => 20,
                'used_count'          => fake()->numberBetween(20, 80),
                'start_date'          => now()->subDays(15),
                'end_date'            => now()->addDays(60),
                'status'              => 'paused',
                'is_auto_apply'       => false,
                'is_featured'         => false,
                'priority'            => 7,
                'created_by'          => $admin?->id,
            ],
        ];

        // Create all promotions
        foreach ($promotions as $promotion) {
            Promotion::create($promotion);
        }

        // Count by status
        $activeCount    = Promotion::where('status', 'active')->count();
        $upcomingCount  = Promotion::where('status', 'upcoming')->count();
        $archivedCount  = Promotion::where('status', 'archived')->count();
        $pausedCount    = Promotion::where('status', 'paused')->count();
        $featuredCount  = Promotion::where('is_featured', true)->count();
        $autoApplyCount = Promotion::where('is_auto_apply', true)->count();

        $this->command->info("✅ " . count($promotions) . " promotions created");
        $this->command->info("   - Active: {$activeCount}");
        $this->command->info("   - Upcoming: {$upcomingCount}");
        $this->command->info("   - Archived: {$archivedCount}");
        $this->command->info("   - Paused: {$pausedCount}");
        $this->command->info("   - Featured: {$featuredCount}");
        $this->command->info("   - Auto-apply: {$autoApplyCount}");
        $this->command->newLine();
        $this->command->info('🎉 Promotion seeding completed!');
    }
}
