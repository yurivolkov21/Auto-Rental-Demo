<?php

namespace App\Services;

use App\Models\Car;
use App\Models\Location;
use App\Models\Promotion;
use App\Models\DriverProfile;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Booking Pricing Service
 *
 * Centralized service for all booking pricing calculations.
 * Provides reusable methods for rental price, driver fees, delivery fees,
 * promotions, overtime charges, and complete pricing breakdowns.
 *
 * @package App\Services
 */
class BookingPricingService
{
    /**
     * Calculate car rental base price
     *
     * Calculates the base rental amount based on hourly and daily rates.
     * Auto-converts hours to days when threshold is reached.
     *
     * @param Carbon $pickupDatetime Scheduled pickup date and time
     * @param Carbon $returnDatetime Scheduled return date and time
     * @param Car $car The car being rented
     * @return array [
     *   'total_hours' => int,
     *   'total_days' => int,
     *   'remaining_hours' => int,
     *   'base_amount' => float,
     *   'hourly_rate' => float,
     *   'daily_rate' => float,
     *   'daily_hour_threshold' => int
     * ]
     */
    public function calculateRentalPrice(
        Carbon $pickupDatetime,
        Carbon $returnDatetime,
        Car $car
    ): array {
        // Calculate total rental duration in hours
        $totalHours = (int) ceil($pickupDatetime->diffInHours($returnDatetime));

        // Get car pricing configuration
        $hourlyRate = (float) $car->hourly_rate;
        $dailyRate = (float) $car->daily_rate;
        $threshold = $car->daily_hour_threshold ?? 10;

        // Convert hours to days based on threshold
        $totalDays = (int) floor($totalHours / $threshold);
        $remainingHours = $totalHours % $threshold;

        // Calculate base amount
        $baseAmount = ($totalDays * $dailyRate) + ($remainingHours * $hourlyRate);

        return [
            'total_hours'          => $totalHours,
            'total_days'           => $totalDays,
            'remaining_hours'      => $remainingHours,
            'base_amount'          => round($baseAmount, 2),
            'hourly_rate'          => $hourlyRate,
            'daily_rate'           => $dailyRate,
            'daily_hour_threshold' => $threshold,
        ];
    }

    /**
     * Calculate driver service fee
     *
     * Calculates the driver fee based on hourly and daily rates.
     * Similar to rental calculation but using driver's rates.
     *
     * @param int $totalHours Total rental hours
     * @param DriverProfile|null $driverProfile The driver profile (null if no driver)
     * @return array [
     *   'driver_fee_amount' => float,
     *   'total_driver_hours' => int,
     *   'driver_hourly_fee' => float|null,
     *   'driver_daily_fee' => float|null,
     *   'driver_days' => int,
     *   'driver_remaining_hours' => int
     * ]
     */
    public function calculateDriverFee(
        int $totalHours,
        ?DriverProfile $driverProfile
    ): array {
        // No driver service requested
        if (!$driverProfile) {
            return [
                'driver_fee_amount'      => 0,
                'total_driver_hours'     => 0,
                'driver_hourly_fee'      => null,
                'driver_daily_fee'       => null,
                'driver_days'            => 0,
                'driver_remaining_hours' => 0,
            ];
        }

        // Get driver pricing configuration
        $hourlyFee = (float) $driverProfile->hourly_fee;
        $dailyFee = (float) $driverProfile->daily_fee;
        $threshold = $driverProfile->daily_hour_threshold ?? 10;

        // Convert hours to days
        $driverDays = (int) floor($totalHours / $threshold);
        $driverRemainingHours = $totalHours % $threshold;

        // Calculate driver fee amount
        $driverFeeAmount = ($driverDays * $dailyFee) + ($driverRemainingHours * $hourlyFee);

        return [
            'driver_fee_amount'      => round($driverFeeAmount, 2),
            'total_driver_hours'     => $totalHours,
            'driver_hourly_fee'      => $hourlyFee,
            'driver_daily_fee'       => $dailyFee,
            'driver_days'            => $driverDays,
            'driver_remaining_hours' => $driverRemainingHours,
        ];
    }

    /**
     * Calculate delivery fee with distance
     *
     * Calculates delivery fee based on distance between pickup location
     * and delivery address. Uses Haversine formula for distance calculation.
     *
     * @param bool $isDelivery Whether delivery is requested
     * @param string|null $deliveryAddress Delivery address (requires geocoding in production)
     * @param Location $pickupLocation Pickup location with coordinates
     * @param Car $car The car (for delivery settings)
     * @return array [
     *   'can_deliver' => bool,
     *   'delivery_fee' => float,
     *   'delivery_distance' => float|null,
     *   'delivery_fee_per_km' => float|null,
     *   'error_message' => string|null
     * ]
     */
    public function calculateDeliveryFee(
        bool $isDelivery,
        ?string $deliveryAddress,
        Location $pickupLocation,
        Car $car
    ): array {
        // No delivery requested
        if (!$isDelivery) {
            return [
                'can_deliver'         => false,
                'delivery_fee'        => 0,
                'delivery_distance'   => null,
                'delivery_fee_per_km' => null,
                'error_message'       => null,
            ];
        }

        // Check if car allows delivery
        if (!$car->is_delivery_available) {
            return [
                'can_deliver'         => false,
                'delivery_fee'        => 0,
                'delivery_distance'   => null,
                'delivery_fee_per_km' => null,
                'error_message'       => 'This car does not offer delivery service.',
            ];
        }

        // Check if delivery rate is set
        if (!$car->delivery_fee_per_km) {
            return [
                'can_deliver'         => false,
                'delivery_fee'        => 0,
                'delivery_distance'   => null,
                'delivery_fee_per_km' => null,
                'error_message'       => 'Delivery rate not configured for this car.',
            ];
        }

        // In production, you would geocode the delivery address to get coordinates.
        // For now, we'll use a simplified approach with random distance for demo.
        // TODO: Integrate with Google Maps Geocoding API or similar service.

        // Simplified: Generate random distance (1-30km) for demo
        // In production: Use real geocoding + Haversine formula
        $distance = $this->calculateEstimatedDistance($deliveryAddress, $pickupLocation);

        // Check if within max delivery distance
        if ($car->max_delivery_distance && $distance > $car->max_delivery_distance) {
            return [
                'can_deliver'         => false,
                'delivery_fee'        => 0,
                'delivery_distance'   => $distance,
                'delivery_fee_per_km' => (float) $car->delivery_fee_per_km,
                'error_message'       => "Delivery distance ({$distance}km) exceeds maximum allowed ({$car->max_delivery_distance}km).",
            ];
        }

        // Calculate delivery fee
        $deliveryFee = $distance * (float) $car->delivery_fee_per_km;

        return [
            'can_deliver'         => true,
            'delivery_fee'        => round($deliveryFee, 2),
            'delivery_distance'   => round($distance, 2),
            'delivery_fee_per_km' => (float) $car->delivery_fee_per_km,
            'error_message'       => null,
        ];
    }

    /**
     * Validate and calculate promotion discount
     *
     * Validates promotion code and calculates discount amount.
     * Checks all promotion rules (dates, usage limits, minimums, etc.)
     *
     * @param string|null $promotionCode Promotion code entered by user
     * @param float $baseAmount Base rental amount (before discount)
     * @param int $userId User ID applying the promotion
     * @param int $rentalHours Total rental hours
     * @return array [
     *   'is_valid' => bool,
     *   'discount_amount' => float,
     *   'promotion_id' => int|null,
     *   'promotion_code' => string|null,
     *   'promotion_details' => array|null,
     *   'error_message' => string|null
     * ]
     */
    public function calculateDiscount(
        ?string $promotionCode,
        float $baseAmount,
        int $userId,
        int $rentalHours
    ): array {
        // No promotion code provided
        if (!$promotionCode) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => null,
                'promotion_code'    => null,
                'promotion_details' => null,
                'error_message'     => null,
            ];
        }

        // Find promotion by code
        $promotion = Promotion::where('code', $promotionCode)->first();

        if (!$promotion) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => null,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => 'Invalid promotion code.',
            ];
        }

        // Check if promotion is active
        if ($promotion->status !== 'active') {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => 'This promotion is not currently active.',
            ];
        }

        // Check date validity
        $now = now();
        if ($now->lt($promotion->start_date) || $now->gt($promotion->end_date)) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => 'This promotion is not valid at this time.',
            ];
        }

        // Check minimum amount requirement
        if ($baseAmount < $promotion->min_amount) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => "Minimum order amount of {$promotion->min_amount} required.",
            ];
        }

        // Check minimum rental hours requirement
        if ($rentalHours < $promotion->min_rental_hours) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => "Minimum rental duration of {$promotion->min_rental_hours} hours required.",
            ];
        }

        // Check global usage limit
        if ($promotion->max_uses && $promotion->used_count >= $promotion->max_uses) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => 'This promotion has reached its usage limit.',
            ];
        }

        // Check per-user usage limit
        $userUsageCount = DB::table('booking_promotions')
            ->join('bookings', 'booking_promotions.booking_id', '=', 'bookings.id')
            ->where('booking_promotions.promotion_id', $promotion->id)
            ->where('bookings.user_id', $userId)
            ->count();

        if ($userUsageCount >= $promotion->max_uses_per_user) {
            return [
                'is_valid'          => false,
                'discount_amount'   => 0,
                'promotion_id'      => $promotion->id,
                'promotion_code'    => $promotionCode,
                'promotion_details' => null,
                'error_message'     => 'You have already used this promotion the maximum number of times.',
            ];
        }

        // Calculate discount amount
        $discountAmount = 0;

        if ($promotion->discount_type === 'percentage') {
            // Percentage discount
            $discountAmount = ($baseAmount * (float) $promotion->discount_value) / 100;

            // Apply max discount cap if exists
            if ($promotion->max_discount && $discountAmount > $promotion->max_discount) {
                $discountAmount = (float) $promotion->max_discount;
            }
        } else {
            // Fixed amount discount
            $discountAmount = (float) $promotion->discount_value;

            // Don't exceed base amount
            if ($discountAmount > $baseAmount) {
                $discountAmount = $baseAmount;
            }
        }

        // Prepare promotion details snapshot
        $promotionDetails = [
            'name'           => $promotion->name,
            'description'    => $promotion->description,
            'discount_type'  => $promotion->discount_type,
            'discount_value' => (float) $promotion->discount_value,
            'max_discount'   => $promotion->max_discount ? (float) $promotion->max_discount : null,
            'min_amount'     => (float) $promotion->min_amount,
        ];

        return [
            'is_valid'          => true,
            'discount_amount'   => round($discountAmount, 2),
            'promotion_id'      => $promotion->id,
            'promotion_code'    => $promotionCode,
            'promotion_details' => $promotionDetails,
            'error_message'     => null,
        ];
    }

    /**
     * Calculate overtime fee for late returns
     *
     * Calculates additional charges when car is returned late.
     *
     * @param Carbon $scheduledReturn Scheduled return datetime
     * @param Carbon $actualReturn Actual return datetime
     * @param Car $car The car (for overtime rate)
     * @return array [
     *   'is_late' => bool,
     *   'late_hours' => int,
     *   'overtime_fee' => float
     * ]
     */
    public function calculateOvertimeFee(
        Carbon $scheduledReturn,
        Carbon $actualReturn,
        Car $car
    ): array {
        // Not late - returned on time or early
        if ($actualReturn->lte($scheduledReturn)) {
            return [
                'is_late'      => false,
                'late_hours'   => 0,
                'overtime_fee' => 0,
            ];
        }

        // Calculate late hours (ceiling - round up)
        $lateHours = (int) ceil($scheduledReturn->diffInHours($actualReturn));

        // Calculate overtime fee
        $overtimeFee = $lateHours * (float) $car->overtime_fee_per_hour;

        return [
            'is_late'      => true,
            'late_hours'   => $lateHours,
            'overtime_fee' => round($overtimeFee, 2),
        ];
    }

    /**
     * Calculate complete pricing breakdown
     *
     * Master method that orchestrates all pricing calculations.
     * Returns comprehensive breakdown with all charges, discounts, and totals.
     *
     * @param array $data Input data [
     *   'car_id' => int,
     *   'pickup_datetime' => string|Carbon,
     *   'return_datetime' => string|Carbon,
     *   'with_driver' => bool,
     *   'driver_profile_id' => int|null,
     *   'is_delivery' => bool,
     *   'delivery_address' => string|null,
     *   'promotion_code' => string|null,
     *   'user_id' => int,
     *   'insurance_fee' => float (optional, default 0),
     *   'extra_fee' => float (optional, default 0),
     *   'apply_vat' => bool (optional, default true),
     *   'amount_paid' => float (optional, default 0)
     * ]
     * @return array Complete pricing breakdown
     */
    public function calculateTotalBreakdown(array $data): array
    {
        // Load required models
        $car = Car::with(['owner', 'brand', 'category', 'location'])->findOrFail($data['car_id']);
        $pickupLocation = Location::findOrFail($data['pickup_location_id'] ?? $car->location_id);

        // Parse datetimes
        $pickupDatetime = $data['pickup_datetime'] instanceof Carbon
            ? $data['pickup_datetime']
            : Carbon::parse($data['pickup_datetime']);

        $returnDatetime = $data['return_datetime'] instanceof Carbon
            ? $data['return_datetime']
            : Carbon::parse($data['return_datetime']);

        // 1. Calculate car rental base price
        $rental = $this->calculateRentalPrice($pickupDatetime, $returnDatetime, $car);

        // 2. Calculate driver fee (if applicable)
        $driverProfile = null;
        if ($data['with_driver'] ?? false) {
            $driverProfile = DriverProfile::find($data['driver_profile_id']);
        }
        $driver = $this->calculateDriverFee($rental['total_hours'], $driverProfile);

        // 3. Calculate delivery fee (if applicable)
        $delivery = $this->calculateDeliveryFee(
            $data['is_delivery'] ?? false,
            $data['delivery_address'] ?? null,
            $pickupLocation,
            $car
        );

        // 4. Calculate discount (if promotion code provided)
        $discount = $this->calculateDiscount(
            $data['promotion_code'] ?? null,
            $rental['base_amount'],
            $data['user_id'],
            $rental['total_hours']
        );

        // 5. Additional fees
        $insuranceFee = $data['insurance_fee'] ?? 0;
        $extraFee = $data['extra_fee'] ?? 0;

        // 6. Calculate financial totals
        $subtotal = $rental['base_amount']
            + $delivery['delivery_fee']
            + $driver['driver_fee_amount']
            + $insuranceFee
            + $extraFee
            - $discount['discount_amount'];

        // Apply VAT (10% - typical in Vietnam)
        $applyVat = $data['apply_vat'] ?? true;
        $vatAmount = $applyVat ? ($subtotal * 0.10) : 0;

        $totalAmount = $subtotal + $vatAmount;

        // Payment tracking
        $depositAmount = (float) $car->deposit_amount;
        $amountPaid = $data['amount_paid'] ?? 0;
        $balanceDue = $totalAmount - $amountPaid - $depositAmount;

        // 7. Return comprehensive breakdown
        return [
            // Rental details
            'rental' => $rental,

            // Driver service
            'driver' => $driver,

            // Delivery service
            'delivery' => $delivery,

            // Discount/Promotion
            'discount' => $discount,

            // Additional fees
            'insurance_fee' => round($insuranceFee, 2),
            'extra_fee'     => round($extraFee, 2),

            // Financial totals
            'subtotal'        => round($subtotal, 2),
            'vat_amount'      => round($vatAmount, 2),
            'vat_percentage'  => $applyVat ? 10 : 0,
            'total_amount'    => round($totalAmount, 2),
            'deposit_amount'  => round($depositAmount, 2),
            'amount_paid'     => round($amountPaid, 2),
            'balance_due'     => round($balanceDue, 2),

            // Car details (for reference)
            'car' => [
                'id'    => $car->id,
                'name'  => $car->name ?? "{$car->brand->name} {$car->model}",
                'model' => $car->model,
                'brand' => $car->brand->name ?? null,
            ],

            // Meta
            'calculated_at' => now()->toISOString(),
        ];
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     *
     * Returns distance in kilometers.
     *
     * @param float $lat1 Latitude of first point
     * @param float $lng1 Longitude of first point
     * @param float $lat2 Latitude of second point
     * @param float $lng2 Longitude of second point
     * @return float Distance in kilometers
     */
    private function calculateDistance(
        float $lat1,
        float $lng1,
        float $lat2,
        float $lng2
    ): float {
        $earthRadius = 6371; // Earth's radius in kilometers

        // Convert degrees to radians
        $lat1Rad = deg2rad($lat1);
        $lng1Rad = deg2rad($lng1);
        $lat2Rad = deg2rad($lat2);
        $lng2Rad = deg2rad($lng2);

        // Haversine formula
        $deltaLat = $lat2Rad - $lat1Rad;
        $deltaLng = $lng2Rad - $lng1Rad;

        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
            cos($lat1Rad) * cos($lat2Rad) *
            sin($deltaLng / 2) * sin($deltaLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = $earthRadius * $c;

        return $distance;
    }

    /**
     * Calculate estimated distance for delivery
     *
     * Simplified version for demo. In production, use Google Maps Geocoding API
     * to convert address to coordinates, then use Haversine formula.
     *
     * @param string|null $deliveryAddress Delivery address
     * @param Location $pickupLocation Pickup location with coordinates
     * @return float Distance in kilometers
     */
    private function calculateEstimatedDistance(
        ?string $deliveryAddress,
        Location $pickupLocation
    ): float {
        // TODO: In production, integrate with geocoding service:
        // 1. Geocode delivery address to get lat/lng
        // 2. Use Haversine formula with pickup location coordinates
        // 3. Return actual distance

        // For demo: Generate random distance between 1-30km
        // This simulates distance calculation
        return round(fake()->randomFloat(2, 1, 30), 2);
    }
}
