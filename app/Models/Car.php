<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'category_id',
        'brand_id',
        'location_id',
        'name',
        'model',
        'color',
        'year',
        'license_plate',
        'vin',
        'seats',
        'transmission',
        'fuel_type',
        'odometer_km',
        'insurance_expiry',
        'registration_expiry',
        'last_maintenance_date',
        'next_maintenance_km',
        'is_delivery_available',
        'status',
        'is_verified',
        'description',
        'features',
        'hourly_rate',
        'daily_rate',
        'daily_hour_threshold',
        'deposit_amount',
        'min_rental_hours',
        'overtime_fee_per_hour',
        'delivery_fee_per_km',
        'max_delivery_distance',
        'rental_count',
        'average_rating',
    ];

    protected $casts = [
        'owner_id'              => 'integer',
        'category_id'           => 'integer',
        'brand_id'              => 'integer',
        'location_id'           => 'integer',
        'year'                  => 'integer',
        'seats'                 => 'integer',
        'odometer_km'           => 'integer',
        'next_maintenance_km'   => 'integer',
        'insurance_expiry'      => 'date',
        'registration_expiry'   => 'date',
        'last_maintenance_date' => 'date',
        'is_delivery_available' => 'boolean',
        'is_verified'           => 'boolean',
        'features'              => 'array',
        'hourly_rate'           => 'decimal:2',
        'daily_rate'            => 'decimal:2',
        'daily_hour_threshold'  => 'integer',
        'deposit_amount'        => 'decimal:2',
        'min_rental_hours'      => 'integer',
        'overtime_fee_per_hour' => 'decimal:2',
        'delivery_fee_per_km'   => 'decimal:2',
        'max_delivery_distance' => 'integer',
        'rental_count'          => 'integer',
        'average_rating'        => 'decimal:2',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category()
    {
        return $this->belongsTo(CarCategory::class);
    }

    public function brand()
    {
        return $this->belongsTo(CarBrand::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function images()
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }

    public function primaryImage()
    {
        return $this->hasOne(CarImage::class)->where('is_primary', true);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeForRent($query)
    {
        return $query->where('status', 'available')->where('is_verified', true);
    }

    public function scopeByOwner($query, $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopeByBrand($query, $brandId)
    {
        return $query->where('brand_id', $brandId);
    }

    public function scopeByLocation($query, $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    public function scopePriceRange($query, $minPrice, $maxPrice)
    {
        return $query->whereBetween('daily_rate', [$minPrice, $maxPrice]);
    }

    public function scopePopular($query, $minRentals = 10)
    {
        return $query->where('rental_count', '>=', $minRentals)
            ->orderBy('rental_count', 'desc');
    }

    public function scopeTopRated($query, $minRating = 4.0)
    {
        return $query->where('average_rating', '>=', $minRating)
            ->orderBy('average_rating', 'desc');
    }

    public function scopeSearch($query, $keyword)
    {
        return $query->whereFullText(['model', 'description'], $keyword)
            ->orWhereHas('brand', fn($q) => $q->where('name', 'like', "%{$keyword}%"))
            ->orWhereHas('category', fn($q) => $q->where('name', 'like', "%{$keyword}%"));
    }

    // Helper Methods
    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_verified;
    }

    public function needsMaintenance(): bool
    {
        if ($this->next_maintenance_km && $this->odometer_km >= $this->next_maintenance_km) {
            return true;
        }
        return false;
    }

    public function hasExpiredDocuments(): bool
    {
        $today = now()->toDateString();

        if ($this->insurance_expiry && $this->insurance_expiry < $today) {
            return true;
        }

        if ($this->registration_expiry && $this->registration_expiry < $today) {
            return true;
        }

        return false;
    }

    public function calculateRentalPrice(int $hours): float
    {
        // Case 1: Short rental (< threshold) - Use hourly rate
        if ($hours < $this->daily_hour_threshold) {
            return $hours * $this->hourly_rate;
        }

        // Case 2: Medium rental (>= threshold but < 24h) - Compare both rates
        if ($hours < 24) {
            $hourlyTotal = $hours * $this->hourly_rate;
            return min($hourlyTotal, $this->daily_rate);
        }

        // Case 3: Long rental (>= 24h) - Use daily rate + remaining hours
        $days = floor($hours / 24);
        $remainingHours = $hours % 24;

        $totalPrice = $days * $this->daily_rate;

        // Add remaining hours (use better rate)
        if ($remainingHours > 0) {
            $remainingHourlyPrice = $remainingHours * $this->hourly_rate;
            $totalPrice += min($remainingHourlyPrice, $this->daily_rate);
        }

        return $totalPrice;
    }

    public function incrementRentalCount(): void
    {
        $this->increment('rental_count');
    }

    public function updateAverageRating(float $newRating): void
    {
        $this->average_rating = $newRating;
        $this->save();
    }
}
