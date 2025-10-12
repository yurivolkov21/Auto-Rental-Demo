<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CarBrand extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'logo',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Relationships
    public function cars()
    {
        return $this->hasMany(Car::class, 'brand_id');
    }

    // Helpers
    public function getActiveCarsCountAttribute()
    {
        return $this->cars()->where('status', 'available')->count();
    }
}
