<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    /** @use HasFactory<\Database\Factories\LocationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'address',
        'latitude',
        'longitude',
        'phone',
        'email',
        'opening_time',
        'closing_time',
        'is_24_7',
        'is_airport',
        'is_popular',
        'is_active',
        'sort_order',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'latitude'     => 'decimal:8',
            'longitude'    => 'decimal:8',
            'opening_time' => 'datetime:H:i',
            'closing_time' => 'datetime:H:i',
            'is_24_7'      => 'boolean',
            'is_airport'   => 'boolean',
            'is_popular'   => 'boolean',
            'is_active'    => 'boolean',
            'sort_order'   => 'integer',
        ];
    }

    /**
     * Scope a query to only include active locations.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include airport locations.
     */
    public function scopeAirport($query)
    {
        return $query->where('is_airport', true);
    }

    /**
     * Scope a query to only include popular locations.
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope a query to order by sort_order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    /**
     * Search locations by name or address using fulltext search.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->whereRaw(
            'MATCH(name, address) AGAINST(? IN BOOLEAN MODE)',
            [$term]
        );
    }

    /**
     * Find nearest locations based on coordinates.
     *
     * @param float $latitude User's latitude
     * @param float $longitude User's longitude
     * @param int $limit Number of locations to return
     */
    public function scopeNearby($query, float $latitude, float $longitude, int $limit = 10)
    {
        return $query->selectRaw(
            '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) + sin(radians(?)) *
            sin(radians(latitude)))) AS distance',
            [$latitude, $longitude, $latitude]
        )
            ->where('is_active', true)
            ->orderBy('distance')
            ->limit($limit);
    }

    /**
     * Check if location is currently open.
     */
    public function isOpen(): bool
    {
        if ($this->is_24_7) {
            return true;
        }

        if (!$this->opening_time || !$this->closing_time) {
            return false;
        }

        $now = now()->format('H:i:s');
        return $now >= $this->opening_time && $now <= $this->closing_time;
    }

    /**
     * Get formatted operating hours.
     */
    public function getOperatingHoursAttribute(): string
    {
        if ($this->is_24_7) {
            return '24/7';
        }

        if (!$this->opening_time || !$this->closing_time) {
            return 'Hours not set';
        }

        return sprintf(
            '%s - %s',
            $this->opening_time->format('H:i'),
            $this->closing_time->format('H:i')
        );
    }
}
