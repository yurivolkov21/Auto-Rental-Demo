<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookingPromotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'promotion_id',
        'applied_by',
        'promotion_code',
        'discount_amount',
        'promotion_details',
        'applied_at',
    ];

    protected $casts = [
        'booking_id'        => 'integer',
        'promotion_id'      => 'integer',
        'applied_by'        => 'integer',
        'discount_amount'   => 'decimal:2',
        'promotion_details' => 'array',
        'applied_at'        => 'datetime',
    ];

    // === RELATIONSHIPS ===

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function appliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applied_by');
    }
}
