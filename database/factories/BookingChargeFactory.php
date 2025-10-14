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

        // Calculate subtotal (base + delivery + driver + extra - discount)
        $subtotal = $baseAmount + $deliveryFee + $driverFeeAmount + $extraFee - $discountAmount;

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

        // Apply rounding to nearest thousand (VND) for all amounts
        $baseAmount      = round($baseAmount / 1000) * 1000;
        $deliveryFee     = round($deliveryFee / 1000) * 1000;
        $driverFeeAmount = round($driverFeeAmount / 1000) * 1000;
        $extraFee        = round($extraFee / 1000) * 1000;
        $discountAmount  = round($discountAmount / 1000) * 1000;
        $subtotal        = round($subtotal / 1000) * 1000;
        $vatAmount       = round($vatAmount / 1000) * 1000;
        $totalAmount     = round($totalAmount / 1000) * 1000;
        $depositAmount   = round($depositAmount / 1000) * 1000;
        $amountPaid      = round($amountPaid / 1000) * 1000;
        $balanceDue      = round($balanceDue / 1000) * 1000;
        $refundAmount    = round($refundAmount / 1000) * 1000;

        return [
            'booking_id'        => $booking->id,
            'total_hours'       => $totalHours,
            'total_days'        => $totalDays,
            'hourly_rate'       => $booking->hourly_rate,
            'daily_rate'        => $booking->daily_rate,
            'base_amount'       => $baseAmount,
            'delivery_fee'      => $deliveryFee,
            'driver_fee_amount' => $driverFeeAmount,
            'extra_fee'         => $extraFee,
            'extra_fee_details' => $extraFeeDetails,
            'discount_amount'   => $discountAmount,
            'subtotal'          => $subtotal,
            'vat_amount'        => $vatAmount,
            'total_amount'      => $totalAmount,
            'deposit_amount'    => $depositAmount,
            'amount_paid'       => $amountPaid,
            'balance_due'       => $balanceDue,
            'refund_amount'     => $refundAmount,
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
