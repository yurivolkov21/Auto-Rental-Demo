<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Promotion>
 */
class PromotionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $discountType = fake()->randomElement(['percentage', 'fixed_amount']);
        $discountValue = $discountType === 'percentage'
            ? fake()->randomElement([10, 15, 20, 25])
            : round(fake()->numberBetween(50, 200) * 1000); // 50k-200k VND

        return [
            'code'                => strtoupper(fake()->unique()->bothify('????####')),
            'name'                => fake()->sentence(3),
            'description'         => fake()->paragraph(),
            'discount_type'       => $discountType,
            'discount_value'      => $discountValue,
            'max_discount'        => $discountType === 'percentage' ? round(fake()->numberBetween(100, 500) * 1000) : null,
            'min_amount'          => round(fake()->numberBetween(0, 500) * 1000), // 0-500k VND
            'min_rental_hours'    => fake()->randomElement([4, 8, 12, 24]),
            'max_uses'            => fake()->randomElement([null, 100, 200, 500, 1000]), // null = unlimited
            'max_uses_per_user'   => fake()->randomElement([1, 2, 3]),
            'used_count'          => 0,
            'start_date'          => now()->subDays(fake()->numberBetween(0, 30)),
            'end_date'            => now()->addDays(fake()->numberBetween(30, 90)),
            'status'              => 'active',
            'is_auto_apply'       => false,
            'is_featured'         => fake()->boolean(20), // 20% featured
            'priority'            => fake()->numberBetween(0, 10),
            'created_by'          => User::where('role', 'admin')->first()?->id,
        ];
    }

    /**
     * State for percentage discount promotion.
     */
    public function percentage(int $value = 15): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type'  => 'percentage',
            'discount_value' => $value,
            'max_discount'   => round(fake()->numberBetween(100, 500) * 1000),
        ]);
    }

    /**
     * State for fixed amount discount promotion.
     */
    public function fixedAmount(int $amount = 100): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type'  => 'fixed_amount',
            'discount_value' => $amount * 1000, // Convert to VND
            'max_discount'   => null,
        ]);
    }

    /**
     * State for active promotion.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'active',
            'start_date' => now()->subDays(fake()->numberBetween(1, 30)),
            'end_date'   => now()->addDays(fake()->numberBetween(30, 90)),
        ]);
    }

    /**
     * State for upcoming promotion.
     */
    public function upcoming(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'upcoming',
            'start_date' => now()->addDays(fake()->numberBetween(1, 30)),
            'end_date'   => now()->addDays(fake()->numberBetween(60, 120)),
            'used_count' => 0,
        ]);
    }

    /**
     * State for archived promotion.
     */
    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'archived',
            'start_date' => now()->subDays(fake()->numberBetween(60, 120)),
            'end_date'   => now()->subDays(fake()->numberBetween(1, 30)),
            'used_count' => fake()->numberBetween(50, 500),
        ]);
    }

    /**
     * State for paused promotion.
     */
    public function paused(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'     => 'paused',
            'start_date' => now()->subDays(fake()->numberBetween(1, 30)),
            'end_date'   => now()->addDays(fake()->numberBetween(30, 90)),
            'used_count' => fake()->numberBetween(10, 100),
        ]);
    }

    /**
     * State for featured promotion.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'priority'    => fake()->numberBetween(0, 3), // Higher priority for featured
        ]);
    }

    /**
     * State for auto-apply promotion.
     */
    public function autoApply(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_auto_apply' => true,
            'priority'      => fake()->numberBetween(5, 10), // Lower priority for auto-apply
        ]);
    }
}
