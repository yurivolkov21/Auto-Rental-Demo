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
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('P@ssword123'),
            'remember_token'    => Str::random(10),

            // Two-factor authentication
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,

            // Profile information
            'avatar'        => fake()->optional(0.3)->imageUrl(200, 200, 'people'),
            'bio'           => fake()->optional(0.5)->sentence(10),
            'phone'         => fake()->optional(0.7)->numerify('+84#########'),
            'address'       => fake()->optional(0.6)->address(),
            'date_of_birth' => fake()->optional(0.8)->date('Y-m-d', '-18 years'),

            // Role & status
            'role'   => fake()->randomElement(['customer', 'owner', 'admin']),
            'status' => 'active',

            // OAuth (null by default)
            'provider'    => null,
            'provider_id' => null,

            // Account deletion (null by default)
            'deletion_reason'       => null,
            'deletion_requested_at' => null,
            'deleted_at'            => null,
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
     * Indicate that the user is a customer.
     */
    public function customer(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'customer',
        ]);
    }

    /**
     * Indicate that the user is an owner.
     */
    public function owner(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'owner',
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
            'status' => 'suspended',
        ]);
    }

    /**
     * Indicate that the user account is banned.
     */
    public function banned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'banned',
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
            'password'    => Hash::make('P@ssword123'), // OAuth users still get a password for fallback
        ]);
    }
}
