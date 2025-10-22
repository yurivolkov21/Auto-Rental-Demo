<?php

namespace App\Console\Commands;

use App\Mail\BookingReminder;
use App\Models\Booking;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendBookingReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'bookings:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder emails for upcoming bookings (24 hours before pickup)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Find bookings that:
        // 1. Have pickup time in 23-25 hours (24h window with buffer)
        // 2. Status is 'confirmed' (not cancelled, not completed)
        // 3. Haven't sent reminder yet (we could add a 'reminder_sent_at' field)

        $bookings = Booking::with([
            'user',
            'car.brand',
            'car.category',
            'pickupLocation',
            'returnLocation',
            'driver.user',
        ])
        ->where('status', 'confirmed')
        ->whereBetween('pickup_datetime', [
            now()->addHours(23),
            now()->addHours(25),
        ])
        // Optional: Add this if you implement reminder_sent_at field
        // ->whereNull('reminder_sent_at')
        ->get();

        if ($bookings->isEmpty()) {
            $this->info('No bookings found for reminder emails.');
            return self::SUCCESS;
        }

        $sentCount = 0;

        foreach ($bookings as $booking) {
            try {
                // Send reminder email (queued)
                Mail::to($booking->user->email)->queue(new BookingReminder($booking));

                // Optional: Mark reminder as sent
                // $booking->update(['reminder_sent_at' => now()]);

                $sentCount++;
                $this->info("Reminder sent to {$booking->user->email} for booking {$booking->booking_code}");
            } catch (\Exception $e) {
                $this->error("Failed to send reminder for booking {$booking->booking_code}: {$e->getMessage()}");
            }
        }

        $this->info("Successfully sent {$sentCount} reminder email(s).");

        return self::SUCCESS;
    }
}
