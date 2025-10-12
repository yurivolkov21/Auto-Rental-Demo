<?php

namespace Database\Factories;

use App\Models\CarCategory;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarCategoryFactory extends Factory
{
    protected $model = CarCategory::class;

    public function definition(): array
    {
        $categories = [
            ['name' => 'Sedan', 'icon' => 'car'],
            ['name' => 'SUV', 'icon' => 'truck'],
            ['name' => 'Hatchback', 'icon' => 'car-side'],
            ['name' => 'Minivan', 'icon' => 'van'],
            ['name' => 'Pickup Truck', 'icon' => 'truck-pickup'],
        ];

        $category = fake()->randomElement($categories);

        return [
            'name'        => $category['name'],
            'slug'        => Str::slug($category['name']) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'icon'        => $category['icon'],
            'description' => fake()->optional(0.8)->sentence(12),
            'is_active'   => fake()->boolean(90),
            'sort_order'  => fake()->numberBetween(0, 100),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
