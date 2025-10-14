<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookingCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'total_hours',
        'total_days',
        'hourly_rate',
        'daily_rate',
        'base_amount',
        'delivery_fee',
        'driver_fee_amount',
        'insurance_fee',
        'extra_fee',
        'extra_fee_details',
        'discount_amount',
        'subtotal',
        'vat_amount',
        'total_amount',
        'deposit_amount',
        'amount_paid',
        'balance_due',
        'refund_amount',
    ];

    protected $casts = [
        'booking_id'        => 'integer',
        'total_hours'       => 'integer',
        'total_days'        => 'integer',
        'hourly_rate'       => 'decimal:2',
        'daily_rate'        => 'decimal:2',
        'base_amount'       => 'decimal:2',
        'delivery_fee'      => 'decimal:2',
        'driver_fee_amount' => 'decimal:2',
        'insurance_fee'     => 'decimal:2',
        'extra_fee'         => 'decimal:2',
        'extra_fee_details' => 'array',
        'discount_amount'   => 'decimal:2',
        'subtotal'          => 'decimal:2',
        'vat_amount'        => 'decimal:2',
        'total_amount'      => 'decimal:2',
        'deposit_amount'    => 'decimal:2',
        'amount_paid'       => 'decimal:2',
        'balance_due'       => 'decimal:2',
        'refund_amount'     => 'decimal:2',
    ];

    // === RELATIONSHIPS ===

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    // === HELPER METHODS ===

    public function isPaid(): bool
    {
        return $this->balance_due <= 0;
    }

    public function hasBalance(): bool
    {
        return $this->balance_due > 0;
    }

    public function getAmountDueAttribute(): float
    {
        return max(0, $this->balance_due);
    }

    public function hasRefund(): bool
    {
        return $this->refund_amount > 0;
    }
}
