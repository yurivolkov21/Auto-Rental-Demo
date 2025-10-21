<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarCategory>
 */
class CarCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Economy',
            'Sedan',
            'SUV',
            'MPV',
            'Luxury',
            'Van',
            'Pickup',
            'Electric',
        ]);

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'icon'        => 'car',
            'description' => fake()->sentence(),
            'is_active'   => true,
            'sort_order'  => 0,
        ];
    }

    /**
     * State for inactive category.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
