<?php

namespace Database\Factories;

use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarImage>
 */
class CarImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * Uses Picsum Photos for placeholder images.
     * Replace with real car photos manually via admin panel or database update.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seed = fake()->unique()->numberBetween(1, 10000); // Unique seed for consistent placeholder

        return [
            'car_id'      => Car::factory(),
            'image_path'  => "https://picsum.photos/seed/{$seed}/800/600",
            'alt_text'    => fake()->sentence(3),
            'is_primary'  => false,
            'sort_order'  => fake()->numberBetween(1, 10),
        ];
    }

    /**
     * State for primary image.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }
}
