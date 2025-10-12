<?php

namespace Database\Factories;

use App\Models\CarImage;
use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarImage>
 */
class CarImageFactory extends Factory
{
    protected $model = CarImage::class;

    public function definition(): array
    {
        $car = Car::inRandomOrder()->first() ?? Car::factory()->create();

        // Generate fake image path (in production, this would be actual uploads)
        // Path format: cars/{car_id}/uuid.jpg
        $imagePath = "cars/{$car->id}/" . fake()->unique()->uuid() . '.jpg';

        return [
            'car_id'     => $car->id,
            'image_path' => $imagePath,
            'alt_text'   => fake()->optional(0.7)->sentence(6),
            'is_primary' => false,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }

    /**
     * Indicate that the image is the primary image.
     */
    public function primary(): static
    {
        return $this->state(fn(array $attributes) => [
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }

    /**
     * Create image for a specific car.
     */
    public function forCar(Car $car): static
    {
        return $this->state(fn(array $attributes) => [
            'car_id'     => $car->id,
            'image_path' => "cars/{$car->id}/" . fake()->unique()->uuid() . '.jpg',
        ]);
    }
}
