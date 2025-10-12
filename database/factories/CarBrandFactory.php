<?php

namespace Database\Factories;

use App\Models\CarBrand;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarBrandFactory extends Factory
{
    protected $model = CarBrand::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai',
            'Kia', 'Mitsubishi', 'Suzuki', 'Nissan', 'Chevrolet'
        ]);

        return [
            'name'       => $name,
            'slug'       => Str::slug($name) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'logo'       => fake()->optional(0.7)->imageUrl(200, 200, 'transport'),
            'is_active'  => fake()->boolean(90),
            'sort_order' => fake()->numberBetween(0, 100),
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
