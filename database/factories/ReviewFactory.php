<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get a random completed booking
        $booking = Booking::where('status', 'completed')
            ->whereDoesntHave('review') // Only bookings without reviews
            ->inRandomOrder()
            ->first();

        // Fallback if no completed booking without review exists
        if (!$booking) {
            $booking = Booking::factory()->create(['status' => 'completed']);
        }

        $rating = fake()->numberBetween(1, 5);
        $status = fake()->randomElement(['pending', 'approved', 'rejected']);
        
        // If approved, more likely to be verified
        $isVerified = $status === 'approved' ? fake()->boolean(80) : fake()->boolean(30);

        $comments = [
            1 => [
                'Terrible experience. Car was dirty and broke down.',
                'Very disappointed. Would not recommend.',
                'Poor service. The car had mechanical issues.',
            ],
            2 => [
                'Below expectations. Car was not well maintained.',
                'Not satisfied. Several minor issues during rental.',
                'Could be better. Car needs cleaning and servicing.',
            ],
            3 => [
                'Average experience. Nothing special.',
                'Okay rental. Car was functional but basic.',
                'Decent service. Met basic expectations.',
            ],
            4 => [
                'Good experience overall. Car was clean and reliable.',
                'Very satisfied. Minor issues but staff was helpful.',
                'Great car! Would rent again.',
            ],
            5 => [
                'Excellent service! Car was in perfect condition.',
                'Amazing experience. Highly recommend this car!',
                'Perfect rental. Clean, comfortable, and reliable car.',
                'Outstanding! Best car rental experience ever.',
            ],
        ];

        $comment = fake()->randomElement($comments[$rating]);

        $responseData = [];
        // 60% chance of having a response if approved
        if ($status === 'approved' && fake()->boolean(60)) {
            $responseData = [
                'response' => fake()->randomElement([
                    'Thank you for your feedback! We\'re glad you enjoyed your rental experience.',
                    'We appreciate your review and hope to serve you again soon!',
                    'Thank you for choosing our service. Your satisfaction is our priority!',
                    'We\'re happy to hear you had a great experience. See you next time!',
                ]),
                'responded_by' => User::whereIn('role', ['owner', 'admin'])->inRandomOrder()->first()?->id 
                    ?? User::factory()->create(['role' => 'owner'])->id,
                'responded_at' => fake()->dateTimeBetween('-7 days', 'now'),
            ];
        }

        return [
            'booking_id' => $booking->id,
            'car_id' => $booking->car_id,
            'user_id' => $booking->user_id,
            'rating' => $rating,
            'comment' => $comment,
            'status' => $status,
            'is_verified_booking' => $isVerified,
            ...$responseData,
        ];
    }

    /**
     * Indicate that the review is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'is_verified_booking' => true,
        ]);
    }

    /**
     * Indicate that the review is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the review is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }

    /**
     * Indicate that the review has a response.
     */
    public function withResponse(): static
    {
        return $this->state(fn (array $attributes) => [
            'response' => fake()->paragraph(),
            'responded_by' => User::whereIn('role', ['owner', 'admin'])->inRandomOrder()->first()?->id 
                ?? User::factory()->create(['role' => 'owner'])->id,
            'responded_at' => fake()->dateTimeBetween('-7 days', 'now'),
        ]);
    }

    /**
     * Indicate that the review is verified.
     */
    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified_booking' => true,
        ]);
    }
}
