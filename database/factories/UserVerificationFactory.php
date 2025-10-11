<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserVerification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserVerification>
 */
class UserVerificationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = UserVerification::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $issueDate  = fake()->dateTimeBetween('-10 years', '-1 year');
        $expiryDate = fake()->dateTimeBetween('+1 year', '+10 years');

        return [
            'user_id' => User::factory(),

            // Driving license information
            'driving_license_number' => fake()->numerify('B######'),
            'driving_license_image'  => fake()->imageUrl(800, 600, 'business'),
            'license_type'           => fake()->randomElement(['B2', 'D']),
            'license_issue_date'     => $issueDate->format('Y-m-d'),
            'license_expiry_date'    => $expiryDate->format('Y-m-d'),
            'license_issued_country' => 'Vietnam',

            // Identity verification
            'id_image'     => fake()->imageUrl(800, 600, 'people'),
            'selfie_image' => fake()->imageUrl(600, 600, 'people'),
            'nationality'  => 'Vietnamese',

            // Verification status
            'status' => 'pending',

            // Audit fields (null by default)
            'verified_by'     => null,
            'verified_at'     => null,
            'rejected_by'     => null,
            'rejected_at'     => null,
            'rejected_reason' => null,
        ];
    }

    /**
     * Indicate that the verification is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'      => 'verified',
            'verified_by' => User::where('role', 'admin')->inRandomOrder()->first()?->id ?? User::factory()->admin(),
            'verified_at' => now()->subDays(rand(1, 30)),
        ]);
    }

    /**
     * Indicate that the verification is rejected.
     */
    public function rejected(string $reason = 'Documents are not clear or expired'): static
    {
        return $this->state(fn (array $attributes) => [
            'status'          => 'rejected',
            'rejected_by'     => User::where('role', 'admin')->inRandomOrder()->first()?->id ?? User::factory()->admin(),
            'rejected_reason' => $reason,
            'rejected_at'     => now()->subDays(rand(1, 30)),
        ]);
    }

    /**
     * Indicate that the verification is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'              => 'expired',
            'license_expiry_date' => fake()->dateTimeBetween('-2 years', '-1 day')->format('Y-m-d'),
        ]);
    }

    /**
     * Indicate that the verification is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'          => 'pending',
            'verified_by'     => null,
            'verified_at'     => null,
            'rejected_by'     => null,
            'rejected_reason' => null,
            'rejected_at'     => null,
        ]);
    }
}
