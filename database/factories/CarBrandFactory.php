<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarBrand>
 */
class CarBrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Toyota',
            'Honda',
            'Mazda',
            'Ford',
            'Hyundai',
            'Kia',
            'Mercedes-Benz',
            'BMW',
            'VinFast',
            'Mitsubishi',
        ]);

        return [
            'name'       => $name,
            'slug'       => Str::slug($name),
            'logo'       => 'https://placehold.co/200x100/png?text=' . urlencode($name),
            'is_active'  => true,
            'sort_order' => 0,
        ];
    }

    /**
     * State for inactive brand.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
