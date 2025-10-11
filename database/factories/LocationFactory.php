<?php

namespace Database\Factories;

use App\Models\Location;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Location::class;

    /**
     * Southern Vietnam cities for realistic data.
     *
     * @var array<string>
     */
    protected static array $vietnameseCities = [
        'Ho Chi Minh City',
        'Vung Tau',
        'Can Tho',
        'Phu Quoc',
        'My Tho',
        'Ben Tre',
        'Ca Mau',
        'Rach Gia',
        'Long Xuyen',
        'Soc Trang',
        'Bac Lieu',
        'Con Dao',
    ];

    /**
     * Location types for variety.
     *
     * @var array<string>
     */
    protected static array $locationTypes = [
        'Downtown Office',
        'Airport Branch',
        'City Center',
        'Train Station',
        'Shopping Mall',
        'Hotel Partner',
        'Resort Area',
        'Business District',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $city = fake()->randomElement(self::$vietnameseCities);
        $type = fake()->randomElement(self::$locationTypes);
        $name = "{$type} - {$city}";

        // Generate realistic Vietnam coordinates
        $coordinates = $this->getCoordinatesForCity($city);

        return [
            'name'         => $name,
            'slug'         => Str::slug($name),
            'description'  => fake()->optional(0.7)->sentence(15),
            'address'      => fake()->streetAddress(),
            'latitude'     => $coordinates['lat'],
            'longitude'    => $coordinates['lng'],
            'phone'        => fake()->optional(0.8)->numerify('+84#########'),
            'email'        => fake()->optional(0.6)->safeEmail(),
            'opening_time' => fake()->optional(0.9)->time('H:i:s', '09:00:00'),
            'closing_time' => fake()->optional(0.9)->time('H:i:s', '18:00:00'),
            'is_24_7'      => fake()->boolean(10), // 10% chance
            'is_airport'   => str_contains($type, 'Airport'),
            'is_popular'   => fake()->boolean(30), // 30% chance
            'is_active'    => fake()->boolean(90), // 90% active
            'sort_order'   => fake()->numberBetween(0, 100),
        ];
    }

    /**
     * Get realistic coordinates for major Southern Vietnamese cities.
     *
     * @param string $city
     * @return array{lat: float, lng: float}
     */
    protected function getCoordinatesForCity(string $city): array
    {
        $cityCoordinates = [
            'Ho Chi Minh City' => ['lat' => 10.8231, 'lng' => 106.6297],
            'Vung Tau'         => ['lat' => 10.3460, 'lng' => 107.0843],
            'Can Tho'          => ['lat' => 10.0452, 'lng' => 105.7469],
            'Phu Quoc'         => ['lat' => 10.2130, 'lng' => 103.9670],
            'My Tho'           => ['lat' => 10.3599, 'lng' => 106.3600],
            'Ben Tre'          => ['lat' => 10.2433, 'lng' => 106.3755],
            'Ca Mau'           => ['lat' => 9.1768, 'lng' => 105.1524],
            'Rach Gia'         => ['lat' => 10.0124, 'lng' => 105.0808],
            'Long Xuyen'       => ['lat' => 10.3867, 'lng' => 105.4359],
            'Soc Trang'        => ['lat' => 9.6025, 'lng' => 105.9738],
            'Bac Lieu'         => ['lat' => 9.2851, 'lng' => 105.7244],
            'Con Dao'          => ['lat' => 8.6829, 'lng' => 106.6089],
        ];

        $baseCoords = $cityCoordinates[$city] ?? ['lat' => 10.8231, 'lng' => 106.6297];

        // Add small random offset for variety (within ~5km radius)
        return [
            'lat' => $baseCoords['lat'] + fake()->randomFloat(4, -0.05, 0.05),
            'lng' => $baseCoords['lng'] + fake()->randomFloat(4, -0.05, 0.05),
        ];
    }

    /**
     * Indicate that the location is an airport location.
     */
    public function airport(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_airport' => true,
            'is_popular' => true,
            'is_24_7'    => fake()->boolean(50),
        ]);
    }

    /**
     * Indicate that the location is a popular location.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
            'is_active'  => true,
        ]);
    }

    /**
     * Indicate that the location is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the location is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the location operates 24/7.
     */
    public function twentyFourSeven(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_24_7'      => true,
            'opening_time' => null,
            'closing_time' => null,
        ]);
    }
}
