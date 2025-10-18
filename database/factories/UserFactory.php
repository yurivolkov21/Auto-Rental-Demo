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
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),

            // Two-factor authentication
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,

            // Profile information
            'avatar'        => null,
            'bio'           => null,
            'phone'         => fake()->optional(0.7)->numerify('+84#########'),
            'address'       => null,
            'date_of_birth' => null,

            // Role & status (default to customer)
            'role'   => 'customer',
            'status' => 'active',

            // OAuth (null by default)
            'provider'    => null,
            'provider_id' => null,

            // Status tracking (null by default)
            'status_note'           => null,
            'status_changed_at'     => null,
            'status_changed_by_id'  => null,
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
     * Indicate that the user is a driver.
     */
    public function driver(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'driver',
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
