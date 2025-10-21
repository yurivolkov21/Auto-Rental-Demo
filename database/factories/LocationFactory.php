<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'Sân bay Tân Sơn Nhất',
            'Quận 1 - Trung tâm',
            'Bến xe Miền Đông',
            'Sân bay Cần Thơ',
        ]);

        return [
            'name'          => $name,
            'slug'          => Str::slug($name),
            'description'   => fake()->randomElement([
                'Chi nhánh thuận tiện cho khách du lịch, gần sân bay và trung tâm thành phố.',
                'Vị trí đắc địa, dễ dàng di chuyển đến các điểm tham quan.',
                'Phục vụ 24/7, hỗ trợ khách hàng mọi lúc mọi nơi.',
                'Chi nhánh hiện đại, đội ngũ chuyên nghiệp, thủ tục nhanh gọn.',
            ]),
            'address'       => fake()->address(),
            'latitude'      => fake()->latitude(8.0, 12.0), // Southern Vietnam range
            'longitude'     => fake()->longitude(104.0, 110.0), // Southern Vietnam range
            'phone'         => fake()->numerify('+8428########'),
            'email'         => fake()->unique()->safeEmail(),
            'opening_time'  => '08:00:00',
            'closing_time'  => '18:00:00',
            'is_24_7'       => false,
            'is_airport'    => false,
            'is_popular'    => false,
            'is_active'     => true,
            'sort_order'    => 0,
        ];
    }

    /**
     * State for airport location.
     */
    public function airport(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_airport' => true,
            'is_24_7'    => true,
            'is_popular' => true,
        ]);
    }

    /**
     * State for popular location.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
        ]);
    }

    /**
     * State for 24/7 location.
     */
    public function twentyFourSeven(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_24_7'       => true,
            'opening_time'  => null,
            'closing_time'  => null,
        ]);
    }

    /**
     * State for inactive location.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
