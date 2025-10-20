<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contact>
 */
class ContactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->boolean(70) ? fake()->phoneNumber() : null,
            'subject' => fake()->randomElement([
                'Booking Inquiry',
                'Payment Question',
                'Car Availability',
                'Technical Support',
                'General Inquiry',
                'Feedback',
                'Complaint',
            ]),
            'message' => fake()->paragraph(3),
            'status' => fake()->randomElement(['new', 'in_progress', 'resolved']),
            'admin_notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'user_id' => fake()->boolean(60)
                ? User::inRandomOrder()->first()?->id ?? User::factory()
                : null,
        ];
    }

    public function statusNew(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'new',
            'admin_notes' => null,
        ]);
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'resolved',
            'admin_notes' => fake()->sentence(),
        ]);
    }
}
