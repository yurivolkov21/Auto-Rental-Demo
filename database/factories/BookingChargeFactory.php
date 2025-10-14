<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\BookingCharge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookingCharge>
 */
class BookingChargeFactory extends Factory
{
    protected $model = BookingCharge::class;

    public function definition(): array
    {
        // Get the associated booking (or create one)
        $booking = Booking::inRandomOrder()->first() ?? Booking::factory()->create();

        // Calculate rental duration
        $pickupDate = $booking->pickup_datetime;
        $returnDate = $booking->return_datetime;
        $totalHours = (int) ceil($pickupDate->diffInHours($returnDate));

        // Convert hours to days based on threshold
        $threshold = $booking->daily_hour_threshold ?? 10;
        $totalDays = (int) floor($totalHours / $threshold);
        $remainingHours = $totalHours % $threshold;

        // Calculate base car rental amount
        $baseAmount = ($totalDays * $booking->daily_rate) + ($remainingHours * $booking->hourly_rate);

        // Calculate driver fee (if applicable)
        $driverFeeAmount = 0;
        if ($booking->with_driver && $booking->driver_hourly_fee && $booking->driver_daily_fee) {
            $driverFeeAmount = ($totalDays * $booking->driver_daily_fee) + ($remainingHours * $booking->driver_hourly_fee);
        }

        // Calculate delivery fee (if applicable)
        $deliveryFee = 0;
        if ($booking->is_delivery && $booking->delivery_distance && $booking->delivery_fee_per_km) {
            $deliveryFee = $booking->delivery_distance * $booking->delivery_fee_per_km;
        }

        // Insurance fee (random, 0-5% of base amount)
        $insuranceFee = fake()->boolean(30) ? round($baseAmount * fake()->randomFloat(2, 0, 0.05), 2) : 0;

        // Extra fees (overtime, cleaning, damages - random 0-20% chance)
        $extraFee = 0;
        $extraFeeDetails = null;

        if (fake()->boolean(20)) {
            $extraFeeBreakdown = [];

            if (fake()->boolean(50)) {
                $overtime = fake()->numberBetween(1, 5) * $booking->hourly_rate;
                $extraFeeBreakdown['overtime'] = $overtime;
                $extraFee += $overtime;
            }

            if (fake()->boolean(30)) {
                $cleaning = fake()->numberBetween(50000, 200000);
                $extraFeeBreakdown['cleaning'] = $cleaning;
                $extraFee += $cleaning;
            }

            if (fake()->boolean(10)) {
                $damage = fake()->numberBetween(100000, 1000000);
                $extraFeeBreakdown['damage'] = $damage;
                $extraFee += $damage;
            }

            $extraFeeDetails = $extraFeeBreakdown;
        }

        // Discount amount (will be set by promotions, default 0)
        $discountAmount = 0;

        // Calculate subtotal
        $subtotal = $baseAmount + $deliveryFee + $driverFeeAmount + $insuranceFee + $extraFee - $discountAmount;

        // VAT (10% - common in Vietnam, but optional)
        $vatAmount = fake()->boolean(70) ? round($subtotal * 0.10, 2) : 0;

        // Total amount
        $totalAmount = $subtotal + $vatAmount;

        // Payment tracking
        $depositAmount = $booking->deposit_amount ?? 0;

        // Amount paid (random: 0%, 50%, 100%, or overpaid)
        $paymentScenario = fake()->randomElement(['none', 'partial', 'full', 'overpaid']);
        $amountPaid = match($paymentScenario) {
            'none'     => 0,
            'partial'  => round($totalAmount * fake()->randomFloat(2, 0.3, 0.8), 2),
            'full'     => $totalAmount,
            'overpaid' => round($totalAmount * fake()->randomFloat(2, 1.0, 1.2), 2),
            default    => 0,
        };

        // Balance due
        $balanceDue = $totalAmount - $amountPaid - $depositAmount;

        // Refund amount (if overpaid or cancelled)
        $refundAmount = 0;
        if ($amountPaid > $totalAmount) {
            $refundAmount = $amountPaid - $totalAmount;
        } elseif (in_array($booking->status, ['cancelled', 'rejected']) && $depositAmount > 0) {
            $refundAmount = fake()->boolean(50) ? $depositAmount * 0.5 : $depositAmount; // 50% or full refund
        }

        return [
            'booking_id'        => $booking->id,
            'total_hours'       => $totalHours,
            'total_days'        => $totalDays,
            'hourly_rate'       => $booking->hourly_rate,
            'daily_rate'        => $booking->daily_rate,
            'base_amount'       => round($baseAmount, 2),
            'delivery_fee'      => round($deliveryFee, 2),
            'driver_fee_amount' => round($driverFeeAmount, 2),
            'insurance_fee'     => round($insuranceFee, 2),
            'extra_fee'         => round($extraFee, 2),
            'extra_fee_details' => $extraFeeDetails,
            'discount_amount'   => round($discountAmount, 2),
            'subtotal'          => round($subtotal, 2),
            'vat_amount'        => round($vatAmount, 2),
            'total_amount'      => round($totalAmount, 2),
            'deposit_amount'    => round($depositAmount, 2),
            'amount_paid'       => round($amountPaid, 2),
            'balance_due'       => round($balanceDue, 2),
            'refund_amount'     => round($refundAmount, 2),
        ];
    }

    /**
     * State: No extra fees
     */
    public function noExtraFees(): static
    {
        return $this->state(fn (array $attributes) => [
            'extra_fee'         => 0,
            'extra_fee_details' => null,
        ]);
    }

    /**
     * State: Fully paid
     */
    public function fullyPaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_paid' => $attributes['total_amount'],
            'balance_due' => 0,
        ]);
    }

    /**
     * State: No payment yet
     */
    public function unpaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'amount_paid' => 0,
            'balance_due' => $attributes['total_amount'] - $attributes['deposit_amount'],
        ]);
    }
}
