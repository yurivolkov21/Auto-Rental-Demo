<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Booking;
use App\Models\Promotion;
use App\Models\BookingPromotion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingPromotion>
 */
class BookingPromotionFactory extends Factory
{
    protected $model = BookingPromotion::class;

    public function definition(): array
    {
        // Get related models
        $booking   = Booking::inRandomOrder()->first() ?? Booking::factory()->create();
        $promotion = Promotion::where('status', 'active')->inRandomOrder()->first()
                     ?? Promotion::factory()->create();

        // Get the booking's charge to calculate discount
        $charge     = $booking->charge;
        $baseAmount = $charge ? $charge->base_amount : 1000000; // Default if no charge

        // Calculate discount based on promotion type
        $discountAmount = 0;

        if ($promotion->discount_type === 'percentage') {
            $discountAmount = round(($baseAmount * $promotion->discount_value) / 100, 2);

            // Apply max discount cap if exists
            if ($promotion->max_discount && $discountAmount > $promotion->max_discount) {
                $discountAmount = $promotion->max_discount;
            }
        } else {
            // Fixed amount
            $discountAmount = $promotion->discount_value;
        }

        // Applied by (customer or admin)
        $appliedBy = fake()->boolean(80) ? $booking->user_id : (User::where('role', 'admin')->inRandomOrder()->first()?->id ?? $booking->user_id);

        // Promotion details snapshot
        $promotionDetails = [
            'name'          => $promotion->name,
            'description'   => $promotion->description,
            'discount_type' => $promotion->discount_type,
            'discount_value'=> $promotion->discount_value,
            'max_discount'  => $promotion->max_discount,
            'min_amount'    => $promotion->min_amount,
        ];

        return [
            'booking_id'        => $booking->id,
            'promotion_id'      => $promotion->id,
            'applied_by'        => $appliedBy,
            'promotion_code'    => $promotion->code,
            'discount_amount'   => $discountAmount,
            'promotion_details' => $promotionDetails,
            'applied_at'        => now(),
        ];
    }
}
