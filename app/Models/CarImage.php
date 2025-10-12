<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class CarImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'car_id',
        'image_path',
        'alt_text',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'car_id'     => 'integer',
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['url'];

    // Relationships
    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    // Attributes
    public function getUrlAttribute(): string
    {
        // Return full URL to the image in storage/app/public
        return asset('storage/' . $this->image_path);
    }

    // Methods
    public function setPrimary(): void
    {
        // Unset other primary images for this car
        static::where('car_id', $this->car_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this image as primary
        $this->update(['is_primary' => true]);
    }

    public function deleteFile(): bool
    {
        return Storage::disk('public')->delete($this->image_path);
    }

    // Scopes
    public function scopeForCar($query, int $carId)
    {
        return $query->where('car_id', $carId);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }
}
