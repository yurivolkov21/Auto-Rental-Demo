<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserVerification>
 */
class UserVerificationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),

            // Driving license information (optional by default)
            'driving_license_number'   => null,
            'license_front_image'      => null,
            'license_back_image'       => null,
            'license_type'             => null,
            'license_issue_date'       => null,
            'license_expiry_date'      => null,
            'license_issued_country'   => null,
            'driving_experience_years' => null,

            // Identity verification (default)
            'id_card_front_image'      => 'https://placehold.co/800x500/png?text=ID+Card+Front',
            'id_card_back_image'       => 'https://placehold.co/800x500/png?text=ID+Card+Back',
            'selfie_image'             => 'https://placehold.co/600x600/png?text=Selfie',
            'nationality'              => 'Vietnam',

            // Verification status (default: verified)
            'status'                   => 'verified',

            // Audit fields
            'verified_by'              => null, // Will be set to admin in seeder
            'verified_at'              => now(),
            'rejected_by'              => null,
            'rejected_at'              => null,
            'rejected_reason'          => null,
        ];
    }

    /**
     * State for customer verification (basic ID verification).
     */
    public function customer(): static
    {
        $countries = [
            'United States', 'United Kingdom', 'Australia', 'Canada', 'France',
            'Germany', 'Japan', 'South Korea', 'Singapore', 'Thailand',
        ];

        return $this->state(fn (array $attributes) => [
            'nationality'               => fake()->randomElement($countries),
            'id_card_front_image'       => 'https://placehold.co/800x500/png?text=Passport+Front',
            'id_card_back_image'        => 'https://placehold.co/800x500/png?text=Passport+Back',
            'selfie_image'              => 'https://placehold.co/600x600/png?text=Customer+Selfie',

            // International customers have international driving license
            'driving_license_number'    => fake()->regexify('[A-Z]{2}[0-9]{8}'),
            'license_front_image'       => 'https://placehold.co/800x500/png?text=License+Front',
            'license_back_image'        => 'https://placehold.co/800x500/png?text=License+Back',
            'license_type'              => fake()->randomElement(['B', 'B1', 'B2', 'International']),
            'license_issue_date'        => fake()->dateTimeBetween('-10 years', '-1 year'),
            'license_expiry_date'       => fake()->dateTimeBetween('+1 year', '+10 years'),
            'license_issued_country'    => fake()->randomElement($countries),
            'driving_experience_years'  => fake()->numberBetween(1, 20),
        ]);
    }

    /**
     * State for owner verification (Vietnamese owner with driving license).
     */
    public function owner(): static
    {
        $issueDate  = fake()->dateTimeBetween('-15 years', '-2 years');
        $expiryDate = (clone $issueDate)->modify('+10 years');

        return $this->state(fn (array $attributes) => [
            'nationality'               => 'Vietnam',
            'id_card_front_image'       => 'https://placehold.co/800x500/png?text=CCCD+Front',
            'id_card_back_image'        => 'https://placehold.co/800x500/png?text=CCCD+Back',
            'selfie_image'              => 'https://placehold.co/600x600/png?text=Owner+Selfie',

            // Vietnamese driving license
            'driving_license_number'    => fake()->numerify('########'),
            'license_front_image'       => 'https://placehold.co/800x500/png?text=GPLX+Front',
            'license_back_image'        => 'https://placehold.co/800x500/png?text=GPLX+Back',
            'license_type'              => fake()->randomElement(['B1', 'B2', 'C', 'D', 'E']),
            'license_issue_date'        => $issueDate,
            'license_expiry_date'       => $expiryDate,
            'license_issued_country'    => 'Vietnam',
            'driving_experience_years'  => fake()->numberBetween(3, 25),
        ]);
    }

    /**
     * State for driver verification (Vietnamese driver with detailed license).
     */
    public function driver(): static
    {
        $issueDate  = fake()->dateTimeBetween('-20 years', '-3 years');
        $expiryDate = (clone $issueDate)->modify('+10 years');

        return $this->state(fn (array $attributes) => [
            'nationality'               => 'Vietnam',
            'id_card_front_image'       => 'https://placehold.co/800x500/png?text=CCCD+Front',
            'id_card_back_image'        => 'https://placehold.co/800x500/png?text=CCCD+Back',
            'selfie_image'              => 'https://placehold.co/600x600/png?text=Driver+Selfie',

            // Vietnamese professional driving license
            'driving_license_number'    => fake()->numerify('########'),
            'license_front_image'       => 'https://placehold.co/800x500/png?text=GPLX+Front',
            'license_back_image'        => 'https://placehold.co/800x500/png?text=GPLX+Back',
            'license_type'              => fake()->randomElement(['B2', 'C', 'D', 'E']), // Professional licenses
            'license_issue_date'        => $issueDate,
            'license_expiry_date'       => $expiryDate,
            'license_issued_country'    => 'Vietnam',
            'driving_experience_years'  => fake()->numberBetween(5, 30), // Drivers have more experience
        ]);
    }

    /**
     * State for pending verification.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'        => 'pending',
            'verified_by'   => null,
            'verified_at'   => null,
        ]);
    }

    /**
     * State for rejected verification.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'            => 'rejected',
            'rejected_by'       => null, // Will be set to admin in seeder
            'rejected_at'       => now()->subDays(fake()->numberBetween(1, 30)),
            'rejected_reason'   => fake()->randomElement([
                'Document images are blurry or unreadable',
                'ID card has expired',
                'Selfie does not match ID card photo',
                'Driving license information is incomplete',
                'Submitted documents appear to be fraudulent',
                'License has expired',
            ]),
            'verified_by'       => null,
            'verified_at'       => null,
        ]);
    }

    /**
     * State for expired verification.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status'                => 'expired',
            'license_expiry_date'   => fake()->dateTimeBetween('-2 years', '-1 day'),
            'verified_at'           => fake()->dateTimeBetween('-3 years', '-2 years'),
        ]);
    }
}
