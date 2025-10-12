# Car Management - Complete Setup Guide

## Overview

Complete implementation guide for **cars** table - the main entity của hệ thống. Car management bao gồm pricing (hourly + daily hybrid), status tracking, verification, và relationships với brands, categories, locations.

**Dependencies**: `users`, `car_brands`, `car_categories`, `locations`

---

## 1. Database Schema

Migration đã được tạo tại `database/migrations/2025_10_09_000000_create_cars_table.php`

**Key Features**:
- Hybrid pricing (hourly + daily with auto-conversion)
- Status tracking (available, rented, maintenance, inactive)
- Admin verification workflow
- Maintenance tracking (odometer_km, insurance, registration)
- Performance metrics (rental_count, average_rating)
- Delivery configuration per car

---

## 2. Model Setup

### Car Model

**File**: `app/Models/Car.php`

```php
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
        'year' => 'integer',
        'seats' => 'integer',
        'odometer_km' => 'integer',
        'insurance_expiry' => 'date',
        'registration_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_km' => 'integer',
        'is_delivery_available' => 'boolean',
        'is_verified' => 'boolean',
        'features' => 'array',
        'hourly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'daily_hour_threshold' => 'integer',
        'deposit_amount' => 'decimal:2',
        'min_rental_hours' => 'integer',
        'overtime_fee_per_hour' => 'decimal:2',
        'delivery_fee_per_km' => 'decimal:2',
        'max_delivery_distance' => 'integer',
        'rental_count' => 'integer',
        'average_rating' => 'decimal:2',
    ];

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category()
    {
        return $this->belongsTo(CarCategory::class, 'category_id');
    }

    public function brand()
    {
        return $this->belongsTo(CarBrand::class, 'brand_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    public function images()
    {
        return $this->hasMany(CarImage::class)->orderBy('sort_order');
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
        return $query->available()->verified();
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

    public function scopePopular($query, $limit = 10)
    {
        return $query->orderByDesc('rental_count')->limit($limit);
    }

    public function scopeTopRated($query, $limit = 10)
    {
        return $query->whereNotNull('average_rating')
            ->orderByDesc('average_rating')
            ->limit($limit);
    }

    // Helper Methods
    public function isAvailable(): bool
    {
        return $this->status === 'available' && $this->is_verified;
    }

    public function needsMaintenance(): bool
    {
        if ($this->next_maintenance_km === null) {
            return false;
        }
        
        return $this->odometer_km >= $this->next_maintenance_km;
    }

    public function hasExpiredDocuments(): bool
    {
        $today = now()->toDateString();
        
        return ($this->insurance_expiry && $this->insurance_expiry < $today)
            || ($this->registration_expiry && $this->registration_expiry < $today);
    }

    public function calculateRentalPrice(int $hours): float
    {
        // Thuê >= 1 ngày: tính theo ngày
        if ($hours >= 24) {
            $days = ceil($hours / 24);
            return $days * $this->daily_rate;
        }
        
        // Thuê >= threshold (VD: 10h): tự động áp giá ngày (có lợi cho khách)
        if ($hours >= $this->daily_hour_threshold) {
            return $this->daily_rate;
        }
        
        // Thuê < threshold: tính theo giờ
        return $hours * $this->hourly_rate;
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? "{$this->brand->name} {$this->model}";
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        return $this->primaryImage?->image_path;
    }
}
```

---

## 3. Factory Setup

### CarFactory

**File**: `database/factories/CarFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use App\Models\CarBrand;
use App\Models\Location;
use App\Models\CarCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarFactory extends Factory
{
    protected $model = Car::class;

    public function definition(): array
    {
        $brand = CarBrand::inRandomOrder()->first();
        $category = CarCategory::inRandomOrder()->first();
        $location = Location::where('is_active', true)->inRandomOrder()->first();
        $owner = User::where('role', 'owner')->inRandomOrder()->first();

        // Auto-generate name from brand + model
        $models = ['Camry', 'Civic', 'Accord', 'Fortuner', 'CR-V', 'City', 'Vios', 'Altis'];
        $model = fake()->randomElement($models);

        return [
            'owner_id' => $owner?->id ?? User::factory()->owner(),
            'category_id' => $category?->id ?? CarCategory::factory(),
            'brand_id' => $brand?->id ?? CarBrand::factory(),
            'location_id' => $location?->id ?? Location::factory(),
            
            'name' => null, // Auto-generated from brand + model
            'model' => $model,
            'color' => fake()->randomElement(['White', 'Black', 'Silver', 'Red', 'Blue']),
            'year' => fake()->numberBetween(2015, 2024),
            'license_plate' => fake()->unique()->numerify('##?-####'),
            'vin' => fake()->optional(0.7)->bothify('VN???????????????'),
            'seats' => fake()->randomElement([4, 5, 7, 9]),
            
            'transmission' => fake()->randomElement(['manual', 'automatic']),
            'fuel_type' => fake()->randomElement(['petrol', 'diesel', 'hybrid']),
            'odometer_km' => fake()->numberBetween(5000, 150000),
            
            'insurance_expiry' => fake()->dateTimeBetween('+1 month', '+2 years'),
            'registration_expiry' => fake()->dateTimeBetween('+1 month', '+2 years'),
            'last_maintenance_date' => fake()->optional()->dateTimeBetween('-6 months', 'now'),
            'next_maintenance_km' => fake()->optional()->numberBetween(160000, 200000),
            
            'is_delivery_available' => fake()->boolean(80),
            'status' => 'available',
            'is_verified' => fake()->boolean(70),
            
            'description' => fake()->optional(0.8)->sentence(20),
            'features' => fake()->randomElements([
                'GPS', 'Bluetooth', 'Backup Camera', 'USB Charging', 
                'Air Conditioning', 'Sunroof', 'Leather Seats'
            ], rand(3, 5)),
            
            // Hybrid pricing
            'hourly_rate' => fake()->numberBetween(40, 100) * 1000,
            'daily_rate' => fake()->numberBetween(400, 1200) * 1000,
            'daily_hour_threshold' => 10,
            'deposit_amount' => fake()->numberBetween(1000, 5000) * 1000,
            'min_rental_hours' => 4,
            'overtime_fee_per_hour' => fake()->numberBetween(50, 150) * 1000,
            
            'delivery_fee_per_km' => fake()->optional()->numberBetween(10, 20) * 1000,
            'max_delivery_distance' => fake()->optional()->numberBetween(15, 50),
            
            'rental_count' => fake()->numberBetween(0, 50),
            'average_rating' => fake()->optional(0.6)->randomFloat(2, 3.5, 5.0),
        ];
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
            'is_verified' => true,
        ]);
    }

    public function rented(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rented',
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }
}
```

---

## 4. Seeder Setup

### CarSeeder

**File**: `database/seeders/CarSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Available & verified cars (50 cars)
        Car::factory()->count(50)->available()->create();

        // 2. Pending verification (10 cars)
        Car::factory()->count(10)->create(['is_verified' => false]);

        // 3. Under maintenance (5 cars)
        Car::factory()->count(5)->create(['status' => 'maintenance']);

        // 4. Currently rented (15 cars)
        Car::factory()->count(15)->rented()->create();

        $this->command->info('✓ Seeded ' . Car::count() . ' cars');
    }
}
```

**Update DatabaseSeeder.php**:
```php
public function run(): void
{
    // Existing seeders...
    $this->call(CarMasterDataSeeder::class);
    $this->call(CarSeeder::class); // Add this
}
```

---

## 5. Controller Example

**File**: `app/Http/Controllers/Admin/CarController.php` (Basic structure)

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Models\Car;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CarController extends Controller
{
    public function index(Request $request)
    {
        $cars = Car::with(['owner', 'brand', 'category', 'location', 'primaryImage'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->verified, fn($q) => $q->where('is_verified', $request->verified === 'yes'))
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Cars/Index', compact('cars'));
    }

    public function verify(Car $car)
    {
        $car->update(['is_verified' => true]);
        return back()->with('success', 'Car verified successfully');
    }
}
```

---

## 6. Usage Examples

```php
// Get available cars for rent
$cars = Car::forRent()
    ->with(['brand', 'category', 'location', 'primaryImage'])
    ->paginate(20);

// Calculate rental price
$car = Car::find(1);
$price = $car->calculateRentalPrice(8); // 8 hours

// Check if car needs maintenance
if ($car->needsMaintenance()) {
    // Alert owner
}

// Popular cars
$popular = Car::popular(10)->get();

// Top rated cars
$topRated = Car::topRated(10)->get();
```

---

## 7. Run Setup

```bash
php artisan migrate
php artisan db:seed --class=CarSeeder
```
