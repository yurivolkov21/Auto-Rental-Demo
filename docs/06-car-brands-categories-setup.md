# Car Brands & Categories Management - Setup Guide

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Status:** 📋 Setup Guide

## Overview

This guide provides comprehensive setup instructions for the Car Brands and Car Categories master data system. These two tables serve as fundamental classification data for the car rental inventory, enabling filtering, searching, and organizing cars by brand (Toyota, Honda) and category type (SUV, Sedan).

**Why Master Data?** Both tables are independent, reusable reference data that:
- Support dropdown filters in car search
- Enable category-based browsing
- Provide brand-specific listings
- Allow flexible car classification without redundancy

**Dependencies:** None - These are foundational master data tables

---

## Architecture

### Database Schema

#### Table: `car_brands`

**Purpose:** Store vehicle brand/manufacturer information

**Columns:**
- `id` (bigint unsigned, PK) - Auto-increment primary key
- `name` (string 100, required) - Brand name (e.g., "Toyota", "Honda")
- `slug` (string 150, unique, indexed) - URL-friendly identifier
- `logo` (string 500, nullable) - Brand logo URL/path for display
- `is_active` (boolean, default true) - Active status flag
- `sort_order` (smallint unsigned, default 0) - Display order priority
- `created_at`, `updated_at` (timestamps)

**Indexes:**
- Primary: `id`
- Unique: `slug`
- Regular: `is_active` (for filtering)
- Composite: `is_active`, `sort_order` (for ordered active brands query)

**Relationships:**
- `hasMany(Car::class, 'brand_id')` - One brand has many cars

---

#### Table: `car_categories`

**Purpose:** Store vehicle category/type classification

**Columns:**
- `id` (bigint unsigned, PK) - Auto-increment primary key
- `name` (string 100, required) - Category name (e.g., "SUV", "Sedan")
- `slug` (string 150, unique, indexed) - URL-friendly identifier
- `icon` (string 50, default 'car') - Icon class for UI display (Lucide icons)
- `description` (text, nullable) - Category description for SEO and customer info
- `is_active` (boolean, default true) - Active status flag
- `sort_order` (smallint unsigned, default 0) - Display order priority
- `created_at`, `updated_at` (timestamps)

**Indexes:**
- Primary: `id`
- Unique: `slug`
- Regular: `is_active` (for filtering)
- Composite: `is_active`, `sort_order` (for ordered active categories query)

**Relationships:**
- `hasMany(Car::class, 'category_id')` - One category has many cars

---

## Backend Structure

### Model: CarBrand

**File:** `app/Models/CarBrand.php`

**Purpose:** Represent vehicle brand/manufacturer entities with business logic for active brands and car counting.

**Key Features:**
- Mass assignment protection with `$fillable`
- Type casting for boolean and integer fields
- Query scopes for active brands and custom ordering
- Dynamic car counting attribute
- Relationship to Car model

```php
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
        'is_active' => 'boolean',
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
```

### CarCategory Model
**File**: `app/Models/CarCategory.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CarCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
        return $this->hasMany(Car::class, 'category_id');
    }

    // Helpers
    public function getActiveCarsCountAttribute()
    {
        return $this->cars()->where('status', 'available')->count();
    }
}
```

---

## 3. Factory Setup

### CarBrandFactory
**File**: `database/factories/CarBrandFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\CarBrand;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarBrandFactory extends Factory
{
    protected $model = CarBrand::class;

    public function definition(): array
    {
        $name = fake()->randomElement([
            'Toyota', 'Honda', 'Ford', 'Mazda', 'Hyundai',
            'Kia', 'Mitsubishi', 'Suzuki', 'Nissan', 'Chevrolet'
        ]);

        return [
            'name' => $name,
            'slug' => Str::slug($name) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'logo' => fake()->optional(0.7)->imageUrl(200, 200, 'transport'),
            'is_active' => fake()->boolean(90),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
```

### CarCategoryFactory
**File**: `database/factories/CarCategoryFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\CarCategory;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarCategoryFactory extends Factory
{
    protected $model = CarCategory::class;

    public function definition(): array
    {
        $categories = [
            ['name' => 'Sedan', 'icon' => 'car'],
            ['name' => 'SUV', 'icon' => 'truck'],
            ['name' => 'Hatchback', 'icon' => 'car-side'],
            ['name' => 'Minivan', 'icon' => 'van'],
            ['name' => 'Pickup Truck', 'icon' => 'truck-pickup'],
        ];

        $category = fake()->randomElement($categories);

        return [
            'name' => $category['name'],
            'slug' => Str::slug($category['name']) . '-' . fake()->unique()->numberBetween(1000, 9999),
            'icon' => $category['icon'],
            'description' => fake()->optional(0.8)->sentence(12),
            'is_active' => fake()->boolean(90),
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }
}
```

---

## 4. Seeder Setup

### Master Data Seeder
**File**: `database/seeders/CarMasterDataSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use App\Models\CarCategory;
use Illuminate\Database\Seeder;

class CarMasterDataSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Car Brands
        $brands = [
            ['name' => 'Toyota', 'slug' => 'toyota', 'sort_order' => 1],
            ['name' => 'Honda', 'slug' => 'honda', 'sort_order' => 2],
            ['name' => 'Ford', 'slug' => 'ford', 'sort_order' => 3],
            ['name' => 'Mazda', 'slug' => 'mazda', 'sort_order' => 4],
            ['name' => 'Hyundai', 'slug' => 'hyundai', 'sort_order' => 5],
            ['name' => 'Kia', 'slug' => 'kia', 'sort_order' => 6],
            ['name' => 'Mitsubishi', 'slug' => 'mitsubishi', 'sort_order' => 7],
            ['name' => 'Suzuki', 'slug' => 'suzuki', 'sort_order' => 8],
            ['name' => 'Nissan', 'slug' => 'nissan', 'sort_order' => 9],
            ['name' => 'Chevrolet', 'slug' => 'chevrolet', 'sort_order' => 10],
        ];

        foreach ($brands as $brand) {
            CarBrand::firstOrCreate(
                ['slug' => $brand['slug']],
                array_merge($brand, ['is_active' => true])
            );
        }

        // Seed Car Categories
        $categories = [
            ['name' => 'Sedan', 'slug' => 'sedan', 'icon' => 'car', 'description' => '4-door passenger car with separate trunk', 'sort_order' => 1],
            ['name' => 'SUV', 'slug' => 'suv', 'icon' => 'truck', 'description' => 'Sport Utility Vehicle with high ground clearance', 'sort_order' => 2],
            ['name' => 'Hatchback', 'slug' => 'hatchback', 'icon' => 'car-side', 'description' => 'Compact car with rear door that swings upward', 'sort_order' => 3],
            ['name' => 'Minivan', 'slug' => 'minivan', 'icon' => 'van', 'description' => '7-9 seater family vehicle', 'sort_order' => 4],
            ['name' => 'Pickup Truck', 'slug' => 'pickup-truck', 'icon' => 'truck-pickup', 'description' => 'Light truck with open cargo area', 'sort_order' => 5],
        ];

        foreach ($categories as $category) {
            CarCategory::firstOrCreate(
                ['slug' => $category['slug']],
                array_merge($category, ['is_active' => true])
            );
        }

        $this->command->info('✓ Seeded ' . CarBrand::count() . ' car brands');
        $this->command->info('✓ Seeded ' . CarCategory::count() . ' car categories');
    }
}
```

**Update DatabaseSeeder.php**:
```php
public function run(): void
{
    // ... existing seeders
    $this->call(CarMasterDataSeeder::class); // Add this line
}
```

---

## 5. Usage Examples

### Query Active Brands/Categories
```php
// Get all active brands ordered
$brands = CarBrand::active()->ordered()->get();

// Get all active categories with car counts
$categories = CarCategory::active()->ordered()->get();
```

### Admin Controller Example
```php
// List brands
public function index()
{
    $brands = CarBrand::withCount('cars')
        ->ordered()
        ->paginate(20);
    
    return Inertia::render('Admin/Brands/Index', compact('brands'));
}

// Toggle status
public function toggleStatus(CarBrand $brand)
{
    $brand->update(['is_active' => !$brand->is_active]);
    return back()->with('success', 'Brand status updated');
}
```

---

## 6. Run Migrations & Seeders

```bash
# Run migrations
php artisan migrate

# Seed master data
php artisan db:seed --class=CarMasterDataSeeder

# Or fresh with all data
php artisan migrate:fresh --seed
```

**Expected Output:**
```
✓ Seeded 10 car brands
✓ Seeded 5 car categories
```
