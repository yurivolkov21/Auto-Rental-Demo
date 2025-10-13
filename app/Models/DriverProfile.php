<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DriverProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'owner_id',
        'hourly_fee',
        'daily_fee',
        'overtime_fee_per_hour',
        'daily_hour_threshold',
        'status',
        'working_hours',
        'is_available_for_booking',
        'completed_trips',
        'average_rating',
        'total_km_driven',
        'total_hours_driven',
    ];

    protected $casts = [
        'hourly_fee'               => 'decimal:2',
        'daily_fee'                => 'decimal:2',
        'overtime_fee_per_hour'    => 'decimal:2',
        'daily_hour_threshold'     => 'integer',
        'is_available_for_booking' => 'boolean',
        'completed_trips'          => 'integer',
        'average_rating'           => 'decimal:2',
        'total_km_driven'          => 'integer',
        'total_hours_driven'       => 'integer',
        'working_hours'            => 'array',
    ];

    // Relationships

    /**
     * Get the user associated with this driver profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the car owner who employs this driver (nullable).
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the driver's verification record through the user.
     */
    public function verification()
    {
        return $this->hasOneThrough(
            UserVerification::class,
            User::class,
            'id',           // Foreign key on users table
            'user_id',    // Foreign key on user_verifications table
            'user_id',    // Local key on driver_profiles table
            'id'   // Local key on users table
        );
    }

    // Query Scopes

    /**
     * Scope a query to only include available drivers.
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
                     ->where('is_available_for_booking', true);
    }

    /**
     * Scope a query to only include drivers on duty.
     */
    public function scopeOnDuty($query)
    {
        return $query->where('status', 'on_duty');
    }

    /**
     * Scope a query to only include verified drivers.
     */
    public function scopeVerified($query)
    {
        return $query->whereHas('verification', function ($q) {
            $q->where('status', 'verified');
        });
    }

    /**
     * Scope a query to filter by owner.
     */
    public function scopeByOwner($query, $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    /**
     * Scope a query to filter by minimum rating.
     */
    public function scopeMinRating($query, $rating)
    {
        return $query->where('average_rating', '>=', $rating);
    }

    // Helper Methods

    /**
     * Calculate driver fee based on hours.
     */
    public function calculateFee(int $hours): float
    {
        // If hours >= threshold, use daily rate + remaining hours
        if ($hours >= $this->daily_hour_threshold) {
            $days = floor($hours / 24);
            $remainingHours = $hours % 24;

            $totalFee = $days * $this->daily_fee;

            if ($remainingHours > 0) {
                // Compare hourly vs daily for remaining hours
                $remainingHourlyFee = $remainingHours * $this->hourly_fee;
                $totalFee += min($remainingHourlyFee, $this->daily_fee);
            }

            return $totalFee;
        }

        // For short rentals, use hourly rate
        return $hours * $this->hourly_fee;
    }

    /**
     * Check if driver is currently available for booking.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_available_for_booking;
    }

    /**
     * Update driver rating after a new review.
     */
    public function updateRating(float $newRating): void
    {
        $totalRatings = $this->completed_trips;
        $currentTotal = ((float)$this->average_rating ?: 0.0) * $totalRatings;
        $newTotal     = $currentTotal + $newRating;

        $this->update([
            'average_rating' => round($newTotal / ($totalRatings + 1), 2),
        ]);
    }

    /**
     * Increment completed trips counter.
     */
    public function incrementTrips(int $kmDriven = 0, int $hoursDriven = 0): void
    {
        $this->completed_trips++;
        $this->total_km_driven += $kmDriven;
        $this->total_hours_driven += $hoursDriven;
        $this->save();
    }
}
