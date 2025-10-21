<?php

namespace Database\Factories;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'                      => fake()->name(),
            'email'                     => fake()->unique()->safeEmail(),
            'email_verified_at'         => now(),
            'password'                  => static::$password ??= Hash::make('password'),
            'remember_token'            => Str::random(10),

            // Two-factor authentication
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,

            // Profile information
            'avatar'                    => null,
            'bio'                       => fake()->optional(0.6)->realText(150),
            'phone'                     => fake()->optional(0.8)->numerify('+84#########'),
            'address'                   => fake()->optional(0.7)->address(),
            'date_of_birth'             => fake()->dateTimeBetween('-65 years', '-18 years'), // Always have DOB (18-65 years old)

            // Role & status (default to customer)
            'role'                      => 'customer',
            'status'                    => 'active',

            // OAuth (null by default)
            'provider'                  => null,
            'provider_id'               => null,

            // Status tracking (null by default)
            'status_note'               => null,
            'status_changed_at'         => null,
            'status_changed_by_id'      => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret'         => Str::random(10),
            'two_factor_recovery_codes' => Str::random(10),
            'two_factor_confirmed_at'   => now(),
        ]);
    }

    /**
     * Indicate that the model does not have two-factor authentication configured.
     */
    public function withoutTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,
        ]);
    }

    /**
     * Indicate that the user is a customer (international tourist).
     */
    public function customer(): static
    {
        $countries = [
            ['code' => 'US', 'phone' => '+1##########', 'name' => 'United States'],
            ['code' => 'UK', 'phone' => '+44##########', 'name' => 'United Kingdom'],
            ['code' => 'AU', 'phone' => '+61#########', 'name' => 'Australia'],
            ['code' => 'CA', 'phone' => '+1##########', 'name' => 'Canada'],
            ['code' => 'FR', 'phone' => '+33#########', 'name' => 'France'],
            ['code' => 'DE', 'phone' => '+49##########', 'name' => 'Germany'],
            ['code' => 'JP', 'phone' => '+81##########', 'name' => 'Japan'],
            ['code' => 'KR', 'phone' => '+82##########', 'name' => 'South Korea'],
            ['code' => 'SG', 'phone' => '+65########', 'name' => 'Singapore'],
            ['code' => 'TH', 'phone' => '+66#########', 'name' => 'Thailand'],
        ];

        $country     = fake()->randomElement($countries);
        $countryCode = $country['code'];
        $countryName = $country['name'];

        $bios = [
            "Love exploring new places and cultures. Visiting Vietnam from {$countryName}.",
            "Traveling enthusiast from {$countryName}. Passionate about road trips and local experiences.",
            "Digital nomad exploring Southeast Asia. Currently based in Vietnam for work and travel.",
            "Business traveler visiting Vietnam regularly. Enjoy exploring cities and coastal areas.",
            "Adventure seeker and road trip lover from {$countryName}. Excited to discover Vietnam!",
            "Frequent traveler from {$countryName}. Love the freedom of self-drive tours.",
            "Vacation mode ON! Exploring Vietnam's beautiful landscapes and vibrant culture.",
            "Travel blogger from {$countryName}. Documenting my Vietnam journey one drive at a time.",
        ];

        return $this->state(fn (array $attributes) => [
            'role'    => 'customer',
            'name'    => fake()->name(), // International name
            'phone'   => fake()->numerify($country['phone']),
            'address' => fake()->streetAddress() . ', ' . fake()->city() . ', ' . $countryName, // Full address
            'bio'     => fake()->randomElement($bios), // Always have bio
        ]);
    }

    /**
     * Indicate that the user is an owner (Vietnamese car owner).
     */
    public function owner(): static
    {
        $vietnameseNames = [
            'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
            'Vũ Thị Fương', 'Đặng Văn Giang', 'Bùi Thị Hương', 'Đỗ Văn Khoa', 'Ngô Thị Lan',
            'Dương Văn Minh', 'Phan Thị Ngọc', 'Võ Văn Phúc', 'Lý Thị Quỳnh', 'Trương Văn Sơn',
            'Mai Thị Thảo', 'Đinh Văn Tùng', 'Cao Thị Uyên', 'Hồ Văn Việt', 'Tô Thị Xuân',
        ];

        $vietnameseCities = [
            'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
            'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Quy Nhơn',
        ];

        $vietnameseStreets = [
            'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Hai Bà Trưng',
            'Hoàng Diệu', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Võ Văn Tần', 'Nguyễn Thị Minh Khai',
        ];

        return $this->state(fn (array $attributes) => [
            'role'          => 'owner',
            'name'          => fake()->randomElement($vietnameseNames),
            'phone'         => fake()->numerify('+849########'),
            'address'       => fake()->numerify('###') . ' ' . fake()->randomElement($vietnameseStreets) . ', ' . fake()->randomElement($vietnameseCities) . ', Việt Nam',
            'bio'           => fake()->randomElement([
                'Chủ xe nhiều năm kinh nghiệm, đảm bảo chất lượng dịch vụ tốt nhất.',
                'Chuyên cho thuê xe du lịch, xe đời mới, bảo dưỡng định kỳ.',
                'Phục vụ tận tâm với giá cả hợp lý. Xe sạch sẽ, an toàn.',
                'Kinh doanh cho thuê xe ô tô tự lái uy tín tại Việt Nam.',
                'Đội xe đa dạng, phù hợp mọi nhu cầu từ du lịch đến công tác.',
                'Cam kết xe chất lượng, thủ tục nhanh gọn, hỗ trợ 24/7.',
                'Chủ xe chuyên nghiệp, xe luôn được vệ sinh và kiểm tra kỹ trước khi giao.',
                'Nhiều năm kinh nghiệm trong lĩnh vực cho thuê xe tự lái.',
            ]),
        ]);
    }

    /**
     * Indicate that the user is a driver (Vietnamese driver).
     */
    public function driver(): static
    {
        $vietnameseNames = [
            'Nguyễn Văn Tài', 'Trần Văn Hùng', 'Lê Văn Thành', 'Phạm Văn Đức', 'Hoàng Văn Long',
            'Vũ Văn Hải', 'Đặng Văn Nam', 'Bùi Văn Quang', 'Đỗ Văn Tuấn', 'Ngô Văn Hòa',
            'Dương Văn Kiên', 'Phan Văn Lâm', 'Võ Văn Bình', 'Lý Văn Cường', 'Trương Văn Đạt',
            'Mai Văn Phong', 'Đinh Văn Sáng', 'Cao Văn Tân', 'Hồ Văn Linh', 'Tô Văn Trung',
        ];

        $vietnameseCities = [
            'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
            'Nha Trang', 'Huế', 'Vũng Tàu', 'Biên Hòa', 'Quy Nhơn',
        ];

        $vietnameseStreets = [
            'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Hai Bà Trưng',
            'Hoàng Diệu', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Võ Văn Tần', 'Nguyễn Thị Minh Khai',
        ];

        return $this->state(fn (array $attributes) => [
            'role'          => 'driver',
            'name'          => fake()->randomElement($vietnameseNames),
            'phone'         => fake()->numerify('+849########'),
            'address'       => fake()->numerify('###') . ' ' . fake()->randomElement($vietnameseStreets) . ', ' . fake()->randomElement($vietnameseCities) . ', Việt Nam',
            'bio'           => fake()->randomElement([
                'Lái xe an toàn, nhiều năm kinh nghiệm trên các cung đường Việt Nam.',
                'Thành thạo đường Hà Nội và các tỉnh miền Bắc, phục vụ tận tình.',
                'Chuyên lái xe du lịch đường dài, am hiểu địa phương và điểm tham quan.',
                'Có bằng B2, lái xe chuyên nghiệp với hơn 10 năm kinh nghiệm.',
                'Tài xế nhiệt tình, am hiểu đường sá và văn hóa địa phương.',
                'Chuyên phục vụ khách du lịch quốc tế, giao tiếp được tiếng Anh cơ bản.',
                'Đảm bảo an toàn tuyệt đối, lái xe êm ái và chuyên nghiệp.',
                'Nhiều năm kinh nghiệm lái xe khách du lịch và dịch vụ đưa đón sân bay.',
            ]),
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    /**
     * Indicate that the user account is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'            => 'suspended',
            'status_note'       => fake()->randomElement([
                'Multiple payment failures',
                'Suspicious activity detected',
                'Pending investigation',
                'Temporary account hold',
                'User requested pause',
            ]),
            'status_changed_at' => now()->subDays(fake()->numberBetween(1, 30)),
        ]);
    }

    /**
     * Indicate that the user account is banned.
     */
    public function banned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'            => 'banned',
            'status_note'       => fake()->randomElement([
                'Fraudulent activity',
                'Severe violation of terms of service',
                'Identity theft',
                'Repeated violations',
                'Legal compliance requirement',
            ]),
            'status_changed_at' => now()->subDays(fake()->numberBetween(1, 90)),
        ]);
    }

    /**
     * Indicate that the user signed up via OAuth.
     */
    public function oauth(string $provider = 'google'): static
    {
        return $this->state(fn (array $attributes) => [
            'provider'    => $provider,
            'provider_id' => fake()->uuid(),
            'password'    => Hash::make('P@ssword123'),
        ]);
    }
}
