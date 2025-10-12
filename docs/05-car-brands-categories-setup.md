# Car Brands & Categories Management - Setup Guide

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Status:** 📋 Setup Guide

## Overview

This guide provides comprehensive setup instructions for Car Brands and Car Categories master data system. These foundational tables enable vehicle classification, filtering, and organization across the car rental platform.

**Purpose:**

- **Car Brands**: Store manufacturer information (Toyota, Honda, Ford)
- **Car Categories**: Store vehicle type classification (SUV, Sedan, Hatchback)

**Why Separate Tables?** Both are independent, reusable reference data that support dropdown filters, category-based browsing, and flexible car classification without redundancy.

**Dependencies:** None - Foundational master data tables

---

## Table of Contents

1. [Database Migration](#database-migration)
2. [Model Configuration](#model-configuration)
3. [Factory Setup](#factory-setup)
4. [Seeder Implementation](#seeder-implementation)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)

---

## Database Migration

### Schema: `car_brands`

**File:** `database/migrations/2025_10_07_000000_create_car_brands_table.php`

**Columns:**

- `id` (bigint unsigned, PK)
- `name` (string 100, required) - Brand name
- `slug` (string 150, unique) - URL-friendly identifier
- `logo` (string 500, nullable) - Logo URL/path
- `is_active` (boolean, default true)
- `sort_order` (smallint unsigned, default 0)
- `timestamps`

**Indexes:**

- Primary: `id`
- Unique: `slug`
- Regular: `is_active`, composite `[is_active, sort_order]`

---

### Schema: `car_categories`

**File:** `database/migrations/2025_10_07_000000_create_car_categories_table.php`

**Columns:**

- `id` (bigint unsigned, PK)
- `name` (string 100, required) - Category name
- `slug` (string 150, unique) - URL-friendly identifier
- `icon` (string 50, default 'car') - Lucide icon class
- `description` (text, nullable) - Category description
- `is_active` (boolean, default true)
- `sort_order` (smallint unsigned, default 0)
- `timestamps`

**Indexes:**

- Primary: `id`
- Unique: `slug`
- Regular: `is_active`, composite `[is_active, sort_order]`

---

## Model Configuration

### Model: `CarBrand`

**File:** `app/Models/CarBrand.php`

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

**Key Features:**

- **Scopes:** `active()` for filtering active brands, `ordered()` for sorting
- **Relationship:** `hasMany` to Car model
- **Helper Attribute:** `active_cars_count` for displaying available car counts
- **Type Casting:** Boolean and integer fields properly cast

---

### Model: `CarCategory`

**File:** `app/Models/CarCategory.php`

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

**Key Features:** Identical structure to CarBrand for consistency

---

## Factory Setup

### Factory: `CarBrandFactory`

**File:** `database/factories/CarBrandFactory.php`

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
        return $this->state(fn (array $attributes) => ['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
```

---

### Factory: `CarCategoryFactory`

**File:** `database/factories/CarCategoryFactory.php`

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
        return $this->state(fn (array $attributes) => ['is_active' => true]);
    }
}
```

---

## Seeder Implementation

### Seeder: `CarMasterDataSeeder`

**File:** `database/seeders/CarMasterDataSeeder.php`

**Purpose:** Seed realistic Vietnamese market brands and standard vehicle categories

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
        // Seed Car Brands (Top 10 in Vietnam)
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

        // Seed Car Categories (Standard vehicle types)
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

**Update DatabaseSeeder.php:**

```php
public function run(): void
{
    // ... existing seeders (users, locations, promotions)
    $this->call(CarMasterDataSeeder::class);
}
```

---

## Usage Examples

### Query Active Brands/Categories

```php
// Get all active brands, ordered
$brands = CarBrand::active()->ordered()->get();

// Get active categories with car counts
$categories = CarCategory::active()
    ->ordered()
    ->withCount('cars')
    ->get();

// Find by slug
$toyota = CarBrand::where('slug', 'toyota')->first();
$suvs = CarCategory::where('slug', 'suv')->first();
```

### Admin Controller Operations

```php
// List brands with car counts
public function index()
{
    $brands = CarBrand::withCount('cars')
        ->ordered()
        ->paginate(20);
    
    return Inertia::render('Admin/Brands/Index', compact('brands'));
}

// Toggle active status
public function toggleStatus(CarBrand $brand)
{
    $brand->update(['is_active' => !$brand->is_active]);
    return back()->with('success', 'Brand status updated successfully');
}
```

---

## Testing

### Run Migrations & Seeders

```bash
# Run migrations
php artisan migrate

# Seed master data only
php artisan db:seed --class=CarMasterDataSeeder

# Fresh migration with all data
php artisan migrate:fresh --seed
```

**Expected Output:**

```bash
✓ Seeded 10 car brands
✓ Seeded 5 car categories
```

### Verify Data

```bash
# Check brand records
php artisan tinker
>>> CarBrand::count()
=> 10

>>> CarBrand::active()->count()
=> 10

# Check category records
>>> CarCategory::count()
=> 5

>>> CarCategory::where('slug', 'suv')->first()->name
=> "SUV"
```

---

## Next Steps

After completing this setup:

1. ✅ Brands and Categories are ready
2. ➡️ Proceed to **05-car-management-setup.md** for main Car model
3. ➡️ Then **06-car-images-management-setup.md** for image gallery

**Integration Points:**

- Car model will reference `brand_id` and `category_id`
- Frontend filters will use these tables for dropdowns
- Search functionality will filter by brand/category
