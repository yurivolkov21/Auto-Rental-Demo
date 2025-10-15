<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'booking_id',
        'car_id',
        'user_id',
        'rating',
        'comment',
        'status',
        'response',
        'responded_by',
        'responded_at',
        'is_verified_booking',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'is_verified_booking' => 'boolean',
        'responded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the booking that this review belongs to.
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the car that this review belongs to.
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * Get the user (reviewer) that created this review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who responded to this review.
     */
    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    /**
     * Scope a query to only include approved reviews.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include pending reviews.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include rejected reviews.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to only include verified booking reviews.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified_booking', true);
    }

    /**
     * Scope a query to filter by rating.
     */
    public function scopeRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    /**
     * Check if review is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if review is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if review is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if review has response.
     */
    public function hasResponse(): bool
    {
        return !is_null($this->response);
    }

    /**
     * Approve the review.
     */
    public function approve(): bool
    {
        $this->status = 'approved';
        return $this->save();
    }

    /**
     * Reject the review.
     */
    public function reject(): bool
    {
        $this->status = 'rejected';
        return $this->save();
    }

    /**
     * Add response to the review.
     */
    public function addResponse(string $response, int $responderId): bool
    {
        $this->response = $response;
        $this->responded_by = $responderId;
        $this->responded_at = now();
        return $this->save();
    }
}
