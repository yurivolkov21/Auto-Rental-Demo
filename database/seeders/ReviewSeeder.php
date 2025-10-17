<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Booking;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure we have completed bookings to review
        $completedBookings = Booking::where('status', 'completed')->get();

        if ($completedBookings->isEmpty()) {
            $this->command->warn('No completed bookings found. Creating sample bookings first...');
            // Create some completed bookings for testing
            $completedBookings = Booking::factory()->count(20)->create(['status' => 'completed']);
        }

        // Create reviews for 50% of completed bookings
        $reviewCount = (int) ceil($completedBookings->count() * 0.5);

        $this->command->info("Creating {$reviewCount} reviews...");

        $approvedCount     = 0;
        $pendingCount      = 0;
        $rejectedCount     = 0;
        $withResponseCount = 0;

        foreach ($completedBookings->random(min($reviewCount, $completedBookings->count())) as $booking) {
            // Skip if booking already has a review
            if ($booking->review()->exists()) {
                continue;
            }

            $review = Review::factory()->create([
                'booking_id' => $booking->id,
                'car_id'     => $booking->car_id,
                'user_id'    => $booking->user_id,
            ]);

            // Count by status
            match ($review->status) {
                'approved' => $approvedCount++,
                'pending'  => $pendingCount++,
                'rejected' => $rejectedCount++,
                default    => null,
            };

            if ($review->response) {
                $withResponseCount++;
            }
        }

        $this->command->info("✅ Created {$reviewCount} reviews:");
        $this->command->info("   - Approved: {$approvedCount}");
        $this->command->info("   - Pending: {$pendingCount}");
        $this->command->info("   - Rejected: {$rejectedCount}");
        $this->command->info("   - With Response: {$withResponseCount}");

        // Calculate average rating
        $avgRating = Review::where('status', 'approved')->avg('rating');
        $this->command->info("   - Average Rating: " . number_format($avgRating, 2) . " ⭐");
    }
}
