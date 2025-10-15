<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_code',
        'user_id',
        'owner_id',
        'car_id',
        'confirmed_by',
        'cancelled_by',
        'pickup_location_id',
        'return_location_id',
        'pickup_datetime',
        'return_datetime',
        'actual_pickup_time',
        'actual_return_time',
        'hourly_rate',
        'daily_rate',
        'daily_hour_threshold',
        'deposit_amount',
        'with_driver',
        'driver_profile_id',
        'driver_hourly_fee',
        'driver_daily_fee',
        'total_driver_hours',
        'driver_notes',
        'is_delivery',
        'delivery_address',
        'delivery_distance',
        'delivery_fee_per_km',
        'status',
        'confirmed_at',
        'cancelled_at',
        'special_requests',
        'admin_notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'user_id'              => 'integer',
        'owner_id'             => 'integer',
        'car_id'               => 'integer',
        'confirmed_by'         => 'integer',
        'cancelled_by'         => 'integer',
        'pickup_location_id'   => 'integer',
        'return_location_id'   => 'integer',
        'driver_profile_id'    => 'integer',
        'pickup_datetime'      => 'datetime',
        'return_datetime'      => 'datetime',
        'actual_pickup_time'   => 'datetime',
        'actual_return_time'   => 'datetime',
        'confirmed_at'         => 'datetime',
        'cancelled_at'         => 'datetime',
        'hourly_rate'          => 'decimal:2',
        'daily_rate'           => 'decimal:2',
        'daily_hour_threshold' => 'integer',
        'deposit_amount'       => 'decimal:2',
        'with_driver'          => 'boolean',
        'driver_hourly_fee'    => 'decimal:2',
        'driver_daily_fee'     => 'decimal:2',
        'total_driver_hours'   => 'integer',
        'is_delivery'          => 'boolean',
        'delivery_distance'    => 'decimal:2',
        'delivery_fee_per_km'  => 'decimal:2',
    ];

    // === RELATIONSHIPS ===

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function pickupLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'pickup_location_id');
    }

    public function returnLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'return_location_id');
    }

    public function driverProfile(): BelongsTo
    {
        return $this->belongsTo(DriverProfile::class);
    }

    public function charge(): HasOne
    {
        return $this->hasOne(BookingCharge::class);
    }

    public function promotions(): HasMany
    {
        return $this->hasMany(BookingPromotion::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    // === SCOPES ===

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForOwner($query, int $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    public function scopeWithDriver($query)
    {
        return $query->where('with_driver', true);
    }

    public function scopeWithDelivery($query)
    {
        return $query->where('is_delivery', true);
    }

    // === HELPER METHODS ===

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    public function canBeConfirmed(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeStarted(): bool
    {
        return $this->status === 'confirmed';
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'active';
    }
}
