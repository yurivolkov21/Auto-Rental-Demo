<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $booking = Booking::inRandomOrder()->first() ?? Booking::factory()->create();
        $amount = fake()->randomFloat(2, 50, 500);

        return [
            'transaction_id' => 'TXN-' . strtoupper(fake()->unique()->bothify('??##??##??##')),
            'booking_id' => $booking->id,
            'user_id' => $booking->user_id,
            'payment_method' => fake()->randomElement(['paypal', 'credit_card', 'bank_transfer', 'cash']),
            'payment_type' => fake()->randomElement(['deposit', 'full_payment', 'partial']),
            'amount' => $amount,
            'currency' => 'USD',
            'status' => fake()->randomElement(['pending', 'completed', 'failed', 'cancelled']),
            'paypal_order_id' => fake()->boolean(70) ? 'PAYPAL-' . strtoupper(fake()->bothify('??##??##??##??##')) : null,
            'paypal_payer_id' => fake()->boolean(70) ? strtoupper(fake()->bothify('??????????##')) : null,
            'paypal_payer_email' => fake()->boolean(70) ? fake()->safeEmail() : null,
            'paypal_response' => fake()->boolean(50) ? [
                'id' => strtoupper(fake()->bothify('??##??##??##??##')),
                'status' => 'COMPLETED',
                'create_time' => now()->toIso8601String(),
            ] : null,
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'paid_at' => fake()->boolean(70) ? fake()->dateTimeBetween('-1 month', 'now') : null,
            'refunded_at' => null,
        ];
    }

    /**
     * Indicate that the payment is completed
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'paid_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the payment is pending
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'paid_at' => null,
        ]);
    }

    /**
     * Indicate that the payment is failed
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'paid_at' => null,
        ]);
    }

    /**
     * Indicate that the payment is refunded
     */
    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refunded',
            'paid_at' => fake()->dateTimeBetween('-1 month', '-1 week'),
            'refunded_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * PayPal payment
     */
    public function paypal(): static
    {
        return $this->state(fn (array $attributes) => [
            'payment_method' => 'paypal',
            'paypal_order_id' => 'PAYPAL-' . strtoupper(fake()->bothify('??##??##??##??##')),
            'paypal_payer_id' => strtoupper(fake()->bothify('??????????##')),
            'paypal_payer_email' => fake()->safeEmail(),
        ]);
    }
}
