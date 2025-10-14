<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Promotion;
use App\Models\BookingCharge;
use Illuminate\Database\Seeder;
use App\Models\BookingPromotion;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🚗 Creating bookings...');

        // Create 50 bookings with various statuses
        $bookings = collect();

        // 10 pending bookings
        $this->command->info('  → Creating 10 pending bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(10)->pending()->create()
        );

        // 15 confirmed bookings
        $this->command->info('  → Creating 15 confirmed bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(15)->confirmed()->create()
        );

        // 5 active bookings
        $this->command->info('  → Creating 5 active bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(5)->active()->create()
        );

        // 15 completed bookings
        $this->command->info('  → Creating 15 completed bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(15)->completed()->create()
        );

        // 3 cancelled bookings
        $this->command->info('  → Creating 3 cancelled bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(3)->cancelled()->create()
        );

        // 2 rejected bookings
        $this->command->info('  → Creating 2 rejected bookings...');
        $bookings = $bookings->merge(
            Booking::factory()->count(2)->rejected()->create()
        );

        // Create 5 bookings with driver service
        $this->command->info('  → Creating 5 bookings with driver service...');
        $bookings = $bookings->merge(
            Booking::factory()->count(5)->withDriver()->confirmed()->create()
        );

        // Create 5 bookings with delivery service
        $this->command->info('  → Creating 5 bookings with delivery...');
        $bookings = $bookings->merge(
            Booking::factory()->count(5)->withDelivery()->confirmed()->create()
        );

        $this->command->info("✅ Created {$bookings->count()} bookings");

        // ============================================
        // Create Booking Charges for all bookings
        // ============================================
        $this->command->info('💰 Creating booking charges...');

        foreach ($bookings as $booking) {
            BookingCharge::factory()->create([
                'booking_id' => $booking->id,
            ]);
        }

        $this->command->info("✅ Created {$bookings->count()} booking charges");

        // ============================================
        // Apply Promotions to 30% of bookings
        // ============================================
        $this->command->info('🎁 Applying promotions to bookings...');

        $activePromotions = Promotion::where('status', 'active')->get();

        if ($activePromotions->isNotEmpty()) {
            $bookingsWithPromotions = $bookings->random(min(20, $bookings->count()));

            foreach ($bookingsWithPromotions as $booking) {
                $promotion = $activePromotions->random();

                // Check if promotion already applied (avoid duplicates)
                if (!$booking->promotions()->where('promotion_id', $promotion->id)->exists()) {
                    BookingPromotion::factory()->create([
                        'booking_id'   => $booking->id,
                        'promotion_id' => $promotion->id,
                    ]);

                    // Update booking charge with discount
                    $bookingPromotion = $booking->promotions()->latest()->first();
                    $charge           = $booking->charge;

                    if ($charge && $bookingPromotion) {
                        $newDiscountAmount = $charge->discount_amount + $bookingPromotion->discount_amount;
                        $newSubtotal       = $charge->base_amount + $charge->delivery_fee + $charge->driver_fee_amount + $charge->extra_fee - $newDiscountAmount;
                        $newVatAmount      = $charge->vat_amount > 0 ? round($newSubtotal * 0.10, 2) : 0;
                        $newTotalAmount    = $newSubtotal + $newVatAmount;
                        $newBalanceDue     = $newTotalAmount - $charge->amount_paid - $charge->deposit_amount;

                        $charge->update([
                            'discount_amount' => $newDiscountAmount,
                            'subtotal'        => $newSubtotal,
                            'vat_amount'      => $newVatAmount,
                            'total_amount'    => $newTotalAmount,
                            'balance_due'     => $newBalanceDue,
                        ]);
                    }
                }
            }

            $promotionCount = BookingPromotion::count();
            $this->command->info("✅ Applied {$promotionCount} promotions to bookings");
        } else {
            $this->command->warn('⚠ No active promotions found. Skipping promotion seeding.');
        }

        // ============================================
        // Summary
        // ============================================
        $this->command->newLine();
        $this->command->info('📊 Booking Seeding Summary:');
        $this->command->table(
            ['Status', 'Count'],
            [
                ['Pending', Booking::where('status', 'pending')->count()],
                ['Confirmed', Booking::where('status', 'confirmed')->count()],
                ['Active', Booking::where('status', 'active')->count()],
                ['Completed', Booking::where('status', 'completed')->count()],
                ['Cancelled', Booking::where('status', 'cancelled')->count()],
                ['Rejected', Booking::where('status', 'rejected')->count()],
                ['With Driver', Booking::where('with_driver', true)->count()],
                ['With Delivery', Booking::where('is_delivery', true)->count()],
                ['Total Bookings', Booking::count()],
            ]
        );

        $this->command->newLine();
    }
}
