<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Promotion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_amount',
        'min_rental_hours',
        'max_uses',
        'max_uses_per_user',
        'used_count',
        'start_date',
        'end_date',
        'status',
        'is_auto_apply',
        'is_featured',
        'priority',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'discount_value'    => 'decimal:2',
        'max_discount'      => 'decimal:2',
        'min_amount'        => 'decimal:2',
        'min_rental_hours'  => 'integer',
        'max_uses'          => 'integer',
        'max_uses_per_user' => 'integer',
        'used_count'        => 'integer',
        'priority'          => 'integer',
        'start_date'        => 'datetime',
        'end_date'          => 'datetime',
        'is_auto_apply'     => 'boolean',
        'is_featured'       => 'boolean',
    ];

    /**
     * Get the admin who created this promotion.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if promotion is expired based on end_date.
     */
    public function isExpired(): bool
    {
        return $this->end_date < now();
    }

    /**
     * Check if promotion is archived.
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    /**
     * Check if promotion should be automatically archived.
     */
    public function shouldBeArchived(): bool
    {
        // Archive if expired
        if ($this->isExpired()) {
            return true;
        }

        // Archive if usage limit reached
        if ($this->hasReachedLimit()) {
            return true;
        }

        return false;
    }

    /**
     * Check if promotion is currently valid.
     */
    public function isValid(): bool
    {
        return $this->status === 'active'
            && $this->start_date <= now()
            && $this->end_date >= now()
            && !$this->hasReachedLimit();
    }

    /**
     * Check if promotion has reached usage limit.
     */
    public function hasReachedLimit(): bool
    {
        if ($this->max_uses === null) {
            return false; // Unlimited uses
        }

        return $this->used_count >= $this->max_uses;
    }

    /**
     * Check if user can use this promotion.
     */
    public function canBeUsedBy(User $user): bool
    {
        // Count how many times user has used this promotion
        // This requires promotion_usages tracking (future enhancement)
        // For now, we'll assume it's available
        return true;
    }

    /**
     * Calculate discount amount for given rental amount.
     */
    public function calculateDiscount(float $rentalAmount): float
    {
        if ($this->discount_type === 'percentage') {
            $discount = $rentalAmount * ($this->discount_value / 100);

            // Apply max_discount cap if set
            if ($this->max_discount !== null && $discount > $this->max_discount) {
                return (float) $this->max_discount;
            }

            return $discount;
        }

        // Fixed amount discount
        return min((float) $this->discount_value, $rentalAmount);
    }

    /**
     * Scope: Get only active promotions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    /**
     * Scope: Get featured promotions.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Get auto-apply promotions.
     */
    public function scopeAutoApply($query)
    {
        return $query->where('is_auto_apply', true);
    }

    /**
     * Scope: Order by priority (lower number = higher priority).
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }

    /**
     * Scope: Search by code or name.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%");
        });
    }
}
