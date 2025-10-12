# Car Management - Setup Guide

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Status:** 📋 Setup Guide

## Overview

This guide provides comprehensive setup instructions for the main **Car** entity system. This is the core model for the car rental platform, managing vehicle inventory, pricing (hybrid hourly + daily rates), maintenance tracking, and rental operations.

**Purpose:**

- Store complete car information (specs, pricing, location, status)
- Track maintenance and document expiry (insurance, registration)
- Manage rental operations with hybrid pricing system
- Support owner verification and multi-status workflow
- Provide performance metrics (rental count, average rating)

**Dependencies:**

- ✅ `users` table (car owners)
- ✅ `locations` table (pickup/dropoff points)
- ✅ `car_brands` table (manufacturer reference)
- ✅ `car_categories` table (vehicle type classification)

---

## Table of Contents

1. [Database Migration](#database-migration)
2. [Hybrid Pricing System](#hybrid-pricing-system)
3. [Model Configuration](#model-configuration)
4. [Factory Setup](#factory-setup)
5. [Seeder Implementation](#seeder-implementation)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)

---

## Database Migration

### Schema: `cars`

**File:** `database/migrations/2025_10_09_000000_create_cars_table.php`

**Core Fields:**

- `id` (bigint unsigned, PK)
- `owner_id` (bigint unsigned → users.id, cascade)
- `category_id` (bigint unsigned → car_categories.id, cascade)
- `brand_id` (bigint unsigned → car_brands.id, cascade)
- `location_id` (bigint unsigned → locations.id, nullable)
- `model` (string 200) - Car model name
- `year` (smallint unsigned) - Manufacturing year
- `license_plate` (string 20, unique) - Vehicle registration number
- `vin` (string 50, unique nullable) - Vehicle Identification Number
- `color` (string 50, nullable)
- `seats` (tinyint unsigned) - Passenger capacity
- `transmission` (enum: automatic, manual)
- `fuel_type` (enum: gasoline, diesel, electric, hybrid)
- `description` (text, nullable)

**Tracking & Maintenance:**

- `odometer_km` (decimal 10,2, default 0) - Current kilometer reading
- `insurance_expiry` (date, nullable) - Insurance expiration date
- `registration_expiry` (date, nullable) - Registration renewal date
- `last_maintenance_date` (date, nullable)
- `next_maintenance_km` (decimal 10,2, nullable) - Next service mileage

**Pricing (Hybrid System):**

- `hourly_rate` (decimal 10,2) - Rate per hour
- `daily_rate` (decimal 10,2) - Rate per day
- `daily_hour_threshold` (tinyint unsigned, default 10) - Hours to switch to daily rate
- `deposit_amount` (decimal 10,2) - Security deposit
- `min_rental_hours` (tinyint unsigned, default 4) - Minimum rental duration
- `overtime_fee_per_hour` (decimal 10,2, nullable) - Late return penalty

**Delivery:**

- `delivery_fee_per_km` (decimal 8,2, nullable) - Delivery cost per kilometer
- `max_delivery_distance` (smallint unsigned, nullable) - Maximum delivery radius (km)
- `is_delivery_available` (boolean, default true)

**Performance Metrics (Denormalized):**

- `rental_count` (int unsigned, default 0) - Total completed rentals
- `average_rating` (decimal 3,2, nullable) - Average customer rating (1.00 - 5.00)

**Status & Verification:**

- `status` (enum: available, rented, maintenance, inactive, default available)
- `is_verified` (boolean, default false) - Admin verification flag
- `timestamps`

**Indexes:**

- Primary: `id`
- Foreign Keys: `owner_id`, `category_id`, `brand_id`, `location_id`
- Unique: `license_plate`, `vin`
- Regular: `status`, `is_verified`, composite `[status, is_verified]`
- Fulltext: `[model, description]` for search

---

## Hybrid Pricing System

### Concept

The hybrid pricing system provides **flexibility** for both short-term hourly rentals and long-term daily rentals, automatically optimizing the price for customers.

**Calculation Logic:**

```php
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
```

**Example Scenarios:**

```php
// Car: hourly_rate = 150,000 VND, daily_rate = 1,200,000 VND, threshold = 10h

calculateRentalPrice(6)   // = 900,000 VND (6 * 150k, < 10h)
calculateRentalPrice(10)  // = 1,200,000 VND (min(10*150k, 1.2M) = 1.2M)
calculateRentalPrice(48)  // = 2,400,000 VND (2 days * 1.2M)
calculateRentalPrice(50)  // = 2,700,000 VND (2 days + 2h = 2.4M + 300k)
```

---

## Model Configuration

### Model: `Car`

**File:** `app/Models/Car.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id', 'category_id', 'brand_id', 'location_id',
        'model', 'year', 'license_plate', 'vin', 'color',
        'seats', 'transmission', 'fuel_type', 'description',
        'odometer_km', 'insurance_expiry', 'registration_expiry',
        'last_maintenance_date', 'next_maintenance_km',
        'hourly_rate', 'daily_rate', 'daily_hour_threshold',
        'deposit_amount', 'min_rental_hours', 'overtime_fee_per_hour',
        'delivery_fee_per_km', 'max_delivery_distance', 'is_delivery_available',
        'rental_count', 'average_rating',
        'status', 'is_verified',
    ];

    protected $casts = [
        'year' => 'integer',
        'seats' => 'integer',
        'odometer_km' => 'decimal:2',
        'insurance_expiry' => 'date',
        'registration_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_km' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'daily_rate' => 'decimal:2',
        'daily_hour_threshold' => 'integer',
        'deposit_amount' => 'decimal:2',
        'min_rental_hours' => 'integer',
        'overtime_fee_per_hour' => 'decimal:2',
        'delivery_fee_per_km' => 'decimal:2',
        'max_delivery_distance' => 'integer',
        'is_delivery_available' => 'boolean',
        'rental_count' => 'integer',
        'average_rating' => 'decimal:2',
        'is_verified' => 'boolean',
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
        // Case 1: Short rental
        if ($hours < $this->daily_hour_threshold) {
            return $hours * $this->hourly_rate;
        }
        
        // Case 2: Medium rental
        if ($hours < 24) {
            $hourlyTotal = $hours * $this->hourly_rate;
            return min($hourlyTotal, $this->daily_rate);
        }
        
        // Case 3: Long rental
        $days = floor($hours / 24);
        $remainingHours = $hours % 24;
        
        $totalPrice = $days * $this->daily_rate;
        
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
```

---

## Factory Setup

### Factory: `CarFactory`

**File:** `database/factories/CarFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use App\Models\Location;
use App\Models\CarBrand;
use App\Models\CarCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarFactory extends Factory
{
    protected $model = Car::class;

    public function definition(): array
    {
        $brand = CarBrand::inRandomOrder()->first() ?? CarBrand::factory()->create();
        $category = CarCategory::inRandomOrder()->first() ?? CarCategory::factory()->create();
        $owner = User::where('role', 'owner')->inRandomOrder()->first() ?? User::factory()->owner()->create();
        $location = Location::inRandomOrder()->first() ?? Location::factory()->create();

        $models = [
            'Camry', 'Corolla', 'Vios', 'Fortuner', 'Innova', // Toyota
            'City', 'Civic', 'CR-V', 'Accord', 'Jazz', // Honda
            'CX-5', 'CX-8', 'Mazda3', 'Mazda6', 'BT-50', // Mazda
        ];

        $hourlyRate = fake()->randomFloat(0, 100000, 300000); // 100k - 300k VND/hour
        $dailyRate = $hourlyRate * 8; // Daily = 8 hours equivalent

        return [
            'owner_id' => $owner->id,
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'location_id' => $location->id,
            'model' => fake()->randomElement($models),
            'year' => fake()->numberBetween(2018, 2024),
            'license_plate' => $this->generateLicensePlate(),
            'vin' => fake()->optional(0.7)->regexify('[A-Z0-9]{17}'),
            'color' => fake()->randomElement(['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray']),
            'seats' => fake()->randomElement([4, 5, 7, 9]),
            'transmission' => fake()->randomElement(['automatic', 'manual']),
            'fuel_type' => fake()->randomElement(['gasoline', 'diesel', 'hybrid']),
            'description' => fake()->optional(0.8)->paragraph(3),
            
            // Tracking
            'odometer_km' => fake()->numberBetween(5000, 150000),
            'insurance_expiry' => fake()->dateTimeBetween('now', '+2 years'),
            'registration_expiry' => fake()->dateTimeBetween('now', '+1 year'),
            'last_maintenance_date' => fake()->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'next_maintenance_km' => fake()->optional(0.7)->numberBetween(160000, 200000),
            
            // Pricing
            'hourly_rate' => $hourlyRate,
            'daily_rate' => $dailyRate,
            'daily_hour_threshold' => 10,
            'deposit_amount' => fake()->numberBetween(2000000, 5000000),
            'min_rental_hours' => 4,
            'overtime_fee_per_hour' => $hourlyRate * 1.5,
            
            // Delivery
            'delivery_fee_per_km' => fake()->optional(0.8)->randomFloat(0, 5000, 15000),
            'max_delivery_distance' => fake()->optional(0.8)->numberBetween(10, 50),
            'is_delivery_available' => fake()->boolean(85),
            
            // Metrics
            'rental_count' => fake()->numberBetween(0, 50),
            'average_rating' => fake()->optional(0.7)->randomFloat(2, 3.5, 5.0),
            
            // Status
            'status' => 'available',
            'is_verified' => true,
        ];
    }

    private function generateLicensePlate(): string
    {
        $cityCodes = ['29', '30', '51', '59', '79']; // HCM, Hanoi, Danang, etc.
        $city = fake()->randomElement($cityCodes);
        $letter = fake()->randomLetter();
        $numbers = fake()->numberBetween(10000, 99999);
        
        return "{$city}{$letter}-{$numbers}";
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

    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'maintenance',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'available',
            'is_verified' => false,
        ]);
    }
}
```

---

## Seeder Implementation

### Seeder: `CarSeeder`

**File:** `database/seeders/CarSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Car;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        // Create cars with different statuses
        Car::factory()->count(50)->available()->create();
        Car::factory()->count(10)->pending()->create();
        Car::factory()->count(5)->maintenance()->create();
        Car::factory()->count(15)->rented()->create();

        $this->command->info('✓ Seeded ' . Car::count() . ' cars');
        $this->command->info('  - Available: ' . Car::where('status', 'available')->count());
        $this->command->info('  - Pending: ' . Car::where('is_verified', false)->count());
        $this->command->info('  - Maintenance: ' . Car::where('status', 'maintenance')->count());
        $this->command->info('  - Rented: ' . Car::where('status', 'rented')->count());
    }
}
```

**Update DatabaseSeeder.php:**

```php
public function run(): void
{
    $this->call(CarMasterDataSeeder::class);
    $this->call(CarSeeder::class);
    $this->call(CarImageSeeder::class); // Next guide
}
```

---

## Usage Examples

### Query Available Cars

```php
// Get all rentable cars (available + verified)
$cars = Car::forRent()
    ->with(['brand', 'category', 'location', 'primaryImage'])
    ->paginate(20);

// Filter by category and price range
$suvs = Car::forRent()
    ->byCategory($categoryId)
    ->priceRange(500000, 2000000)
    ->get();

// Search with keyword
$results = Car::forRent()
    ->search('Toyota Camry')
    ->get();

// Get popular cars
$popular = Car::forRent()
    ->popular(20) // At least 20 rentals
    ->limit(10)
    ->get();
```

### Calculate Rental Price

```php
$car = Car::find(1);

// 6 hours rental
$price = $car->calculateRentalPrice(6);
// = 6 * hourly_rate = 900,000 VND

// 3 days rental
$price = $car->calculateRentalPrice(72);
// = 3 * daily_rate = 3,600,000 VND
```

### Maintenance Checks

```php
$car = Car::find(1);

if ($car->needsMaintenance()) {
    $car->update(['status' => 'maintenance']);
}

if ($car->hasExpiredDocuments()) {
    // Send notification to owner
    // Temporarily disable car
}
```

---

## Testing

### Run Migrations & Seeders

```bash
# Migrate car tables
php artisan migrate

# Seed cars
php artisan db:seed --class=CarSeeder

# Fresh migration with all data
php artisan migrate:fresh --seed
```

**Expected Output:**

```bash
✓ Seeded 80 cars
  - Available: 50
  - Pending: 10
  - Maintenance: 5
  - Rented: 15
```

### Verify Pricing Logic

```bash
php artisan tinker
>>> $car = Car::first()
>>> $car->hourly_rate
=> 150000.00

>>> $car->daily_rate
=> 1200000.00

>>> $car->calculateRentalPrice(6)
=> 900000.0

>>> $car->calculateRentalPrice(10)
=> 1200000.0

>>> $car->calculateRentalPrice(48)
=> 2400000.0
```

---

## Next Steps

After completing this setup:

1. ✅ Car entity is ready with hybrid pricing
2. ➡️ Proceed to **06-car-images-management-setup.md** for image gallery
3. ➡️ Then build Admin CRUD controllers
4. ➡️ Finally create Frontend search/filter pages
