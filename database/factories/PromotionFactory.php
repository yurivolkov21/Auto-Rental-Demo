<?php

namespace Database\Factories;

use App\Models\Promotion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Promotion>
 */
class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        $discountType = fake()->randomElement(['percentage', 'fixed_amount']);
        $startDate    = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate      = Carbon::parse($startDate)->addDays(fake()->numberBetween(7, 90));

        return [
            // Basic Information
            'code'           => strtoupper(fake()->unique()->bothify('??###')),
            'name'           => fake()->randomElement([
                'Summer Sale',
                'Weekend Special',
                'New Customer Discount',
                'Holiday Promo',
                'Flash Sale',
                'Early Bird Special',
                'Last Minute Deal',
            ]) . ' ' . fake()->numberBetween(2024, 2025),
            'description'    => fake()->optional()->sentence(),

            // Discount Configuration
            'discount_type'  => $discountType,
            'discount_value' => $discountType === 'percentage'
                ? fake()->numberBetween(5, 50)
                : fake()->numberBetween(50000, 500000),
            'max_discount'   => $discountType === 'percentage'
                ? fake()->numberBetween(100000, 1000000)
                : null,

            // Requirements
            'min_amount'       => fake()->randomElement([0, 500000, 1000000, 2000000]),
            'min_rental_hours' => fake()->randomElement([4, 12, 24, 48]),

            // Usage Limits
            'max_uses'          => fake()->optional(0.7)->numberBetween(10, 1000),
            'max_uses_per_user' => fake()->numberBetween(1, 3),
            'used_count'        => fake()->numberBetween(0, 50),

            // Validity Period
            'start_date' => $startDate,
            'end_date'   => $endDate,

            // Status & Features
            'status'        => fake()->randomElement(['active', 'paused', 'upcoming']),
            'is_auto_apply' => fake()->boolean(20), // 20% chance true
            'is_featured'   => fake()->boolean(30), // 30% chance true
            'priority'      => fake()->numberBetween(0, 10),

            // Audit Trail
            'created_by' => User::where('role', 'admin')->inRandomOrder()->first()?->id,
        ];
    }

    /**
     * Create an active promotion.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'active',
            'start_date' => now()->subDays(5),
            'end_date'   => now()->addDays(30),
        ]);
    }

    /**
     * Create a featured promotion.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'priority'    => fake()->numberBetween(0, 3),
        ]);
    }

    /**
     * Create an auto-apply promotion.
     */
    public function autoApply(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_auto_apply' => true,
            'priority'      => 0, // Highest priority
        ]);
    }

    /**
     * Create a percentage discount promotion.
     */
    public function percentage(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type'  => 'percentage',
            'discount_value' => fake()->numberBetween(10, 30),
            'max_discount'   => fake()->numberBetween(200000, 500000),
        ]);
    }

    /**
     * Create a fixed amount discount promotion.
     */
    public function fixedAmount(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type'  => 'fixed_amount',
            'discount_value' => fake()->numberBetween(100000, 300000),
            'max_discount'   => null,
        ]);
    }

    /**
     * Create an expired promotion.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subMonths(2),
            'end_date'   => now()->subDays(5),
            'status'     => 'active', // Status still active but expired by date
        ]);
    }
}
