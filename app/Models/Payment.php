<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'booking_id',
        'user_id',
        'payment_method',
        'payment_type',
        'amount',           // Legacy field (deprecated)
        'amount_vnd',       // Primary amount in VND
        'amount_usd',       // Amount in USD
        'exchange_rate',    // Exchange rate at payment time
        'currency',
        'status',
        'paypal_order_id',
        'paypal_payer_id',
        'paypal_payer_email',
        'paypal_response',
        'notes',
        'paid_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'amount_vnd'      => 'decimal:2',
        'amount_usd'      => 'decimal:2',
        'exchange_rate'   => 'decimal:4',
        'paypal_response' => 'array',
        'paid_at'         => 'datetime',
        'refunded_at'     => 'datetime',
    ];

    /**
     * Get the booking that owns the payment
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user who made the payment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if payment is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is refunded
     */
    public function isRefunded(): bool
    {
        return $this->status === 'refunded';
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted(): void
    {
        $this->update([
            'status'  => 'completed',
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
        ]);
    }

    /**
     * Mark payment as refunded
     */
    public function markAsRefunded(): void
    {
        $this->update([
            'status'      => 'refunded',
            'refunded_at' => now(),
        ]);
    }
}
