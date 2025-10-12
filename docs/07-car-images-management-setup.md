# Car Images Management - Setup Guide

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Status:** 📋 Setup Guide

## Overview

This guide provides comprehensive setup instructions for the **Car Images** system. This handles the image gallery for each car, including primary image management, sorting, and file storage integration.

**Purpose:**

- Store multiple images per car (gallery system)
- Manage primary/featured image with automatic logic
- Support image sorting for gallery display
- Handle cascade deletion when car is removed
- Enable frontend image upload and reordering

**Dependencies:**

- ✅ `cars` table (parent entity)
- ✅ Laravel Storage configuration (public disk)
- ✅ Storage symlink setup

---

## Table of Contents

1. [Database Migration](#database-migration)
2. [Storage Configuration](#storage-configuration)
3. [Model Configuration](#model-configuration)
4. [Factory Setup](#factory-setup)
5. [Seeder Implementation](#seeder-implementation)
6. [Controller Operations](#controller-operations)
7. [Usage Examples](#usage-examples)
8. [Testing](#testing)

---

## Database Migration

### Schema: `car_images`

**File:** `database/migrations/2025_10_10_000000_create_car_images_table.php`

**Columns:**

- `id` (bigint unsigned, PK)
- `car_id` (bigint unsigned → cars.id, cascade delete)
- `image_path` (string 500) - Relative path in storage (e.g., `cars/123/image.jpg`)
- `alt_text` (string 255, nullable) - Accessibility text
- `is_primary` (boolean, default false) - Featured image flag
- `sort_order` (smallint unsigned, default 0) - Gallery display order
- `timestamps`

**Indexes:**

- Primary: `id`
- Foreign Key: `car_id` (cascade delete)
- Regular: composite `[car_id, is_primary]` for fast primary image lookup
- Regular: composite `[car_id, sort_order]` for gallery ordering

**Important:** Only ONE image per car can have `is_primary = true`. This is enforced by application logic (not database constraint).

---

## Storage Configuration

### Setup Storage Symlink

**Command:**

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` → `storage/app/public`, making uploaded files accessible via URL.

**Directory Structure:**

```text
storage/
  app/
    public/
      cars/
        {car_id}/
          image1.jpg
          image2.jpg
          ...
```

### Storage Disk Configuration

**File:** `config/filesystems.php` (Default Laravel configuration)

```php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
        'throw' => false,
    ],
],
```

---

## Model Configuration

### Model: `CarImage`

**File:** `app/Models/CarImage.php`

```php
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
        'car_id' => 'integer',
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
        return Storage::disk('public')->url($this->image_path);
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
```

**Key Features:**

- **Accessor:** `url` attribute generates full public URL
- **setPrimary():** Ensures only one primary image per car
- **deleteFile():** Removes physical file from storage
- **Scopes:** Query helpers for filtering and ordering

---

## Factory Setup

### Factory: `CarImageFactory`

**File:** `database/factories/CarImageFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\CarImage;
use App\Models\Car;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarImageFactory extends Factory
{
    protected $model = CarImage::class;

    public function definition(): array
    {
        $car = Car::inRandomOrder()->first() ?? Car::factory()->create();

        // Generate fake image path (in production, this would be actual uploads)
        $imagePath = "cars/{$car->id}/" . fake()->unique()->uuid() . '.jpg';

        return [
            'car_id' => $car->id,
            'image_path' => $imagePath,
            'alt_text' => fake()->optional(0.7)->sentence(6),
            'is_primary' => false,
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }

    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
            'sort_order' => 0,
        ]);
    }

    public function forCar(Car $car): static
    {
        return $this->state(fn (array $attributes) => [
            'car_id' => $car->id,
            'image_path' => "cars/{$car->id}/" . fake()->unique()->uuid() . '.jpg',
        ]);
    }
}
```

---

## Seeder Implementation

### Seeder: `CarImageSeeder`

**File:** `database/seeders/CarImageSeeder.php`

**Purpose:** Create 1 primary image + 3-6 additional images for each car

```php
<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Seeder;

class CarImageSeeder extends Seeder
{
    public function run(): void
    {
        $cars = Car::all();
        $totalImages = 0;

        foreach ($cars as $car) {
            // Create 1 primary image
            CarImage::factory()
                ->forCar($car)
                ->primary()
                ->create();

            // Create 3-6 additional images
            $additionalCount = fake()->numberBetween(3, 6);
            
            for ($i = 1; $i <= $additionalCount; $i++) {
                CarImage::factory()
                    ->forCar($car)
                    ->create(['sort_order' => $i]);
            }

            $totalImages += (1 + $additionalCount);
        }

        $this->command->info('✓ Seeded ' . $totalImages . ' car images for ' . $cars->count() . ' cars');
        $this->command->info('  - Primary images: ' . CarImage::where('is_primary', true)->count());
        $this->command->info('  - Total images: ' . CarImage::count());
    }
}
```

**Update DatabaseSeeder.php:**

```php
public function run(): void
{
    $this->call(CarMasterDataSeeder::class);
    $this->call(CarSeeder::class);
    $this->call(CarImageSeeder::class);
}
```

---

## Controller Operations

### Admin Image Upload Controller

**File:** `app/Http/Controllers/Admin/CarImageController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarImageController extends Controller
{
    public function store(Request $request, Car $car)
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $index => $image) {
            // Store image in storage/app/public/cars/{car_id}/
            $path = $image->store("cars/{$car->id}", 'public');

            // Create database record
            $carImage = CarImage::create([
                'car_id' => $car->id,
                'image_path' => $path,
                'alt_text' => $request->input("alt_text.{$index}"),
                'is_primary' => false,
                'sort_order' => CarImage::where('car_id', $car->id)->max('sort_order') + 1,
            ]);

            $uploadedImages[] = $carImage;
        }

        // If this is the first image, make it primary
        if (CarImage::where('car_id', $car->id)->count() === count($uploadedImages)) {
            $uploadedImages[0]->setPrimary();
        }

        return back()->with('success', 'Images uploaded successfully');
    }

    public function setPrimary(CarImage $image)
    {
        $image->setPrimary();

        return back()->with('success', 'Primary image updated');
    }

    public function reorder(Request $request, Car $car)
    {
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:car_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('images') as $imageData) {
            CarImage::where('id', $imageData['id'])
                ->where('car_id', $car->id)
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return back()->with('success', 'Images reordered successfully');
    }

    public function destroy(CarImage $image)
    {
        $carId = $image->car_id;
        $wasPrimary = $image->is_primary;

        // Delete physical file
        $image->deleteFile();

        // Delete database record
        $image->delete();

        // If deleted image was primary, set first remaining image as primary
        if ($wasPrimary) {
            $firstImage = CarImage::where('car_id', $carId)
                ->ordered()
                ->first();
            
            if ($firstImage) {
                $firstImage->setPrimary();
            }
        }

        return back()->with('success', 'Image deleted successfully');
    }
}
```

**Routes (routes/admin.php):**

```php
Route::prefix('cars/{car}/images')->group(function () {
    Route::post('/', [CarImageController::class, 'store'])->name('admin.car-images.store');
    Route::patch('/{image}/set-primary', [CarImageController::class, 'setPrimary'])->name('admin.car-images.set-primary');
    Route::post('/reorder', [CarImageController::class, 'reorder'])->name('admin.car-images.reorder');
    Route::delete('/{image}', [CarImageController::class, 'destroy'])->name('admin.car-images.destroy');
});
```

---

## Usage Examples

### Query Car with Images

```php
// Get car with all images (ordered)
$car = Car::with(['images' => fn($q) => $q->ordered()])->find(1);

// Get car with only primary image
$car = Car::with('primaryImage')->find(1);

// Get primary image URL
$primaryImageUrl = $car->primaryImage?->url;
```

### Set Primary Image

```php
$image = CarImage::find(5);
$image->setPrimary();

// This will:
// 1. Set all other images for this car to is_primary = false
// 2. Set this image to is_primary = true
```

### Upload Image (Controller Example)

```php
// User uploads file via form
$path = $request->file('image')->store("cars/{$car->id}", 'public');

CarImage::create([
    'car_id' => $car->id,
    'image_path' => $path,
    'alt_text' => $request->input('alt_text'),
    'is_primary' => false,
    'sort_order' => CarImage::where('car_id', $car->id)->max('sort_order') + 1,
]);
```

### Delete Image with File

```php
$image = CarImage::find(5);

// Delete physical file from storage
$image->deleteFile();

// Delete database record
$image->delete();
```

---

## Testing

### Run Migrations & Seeders

```bash
# Setup storage symlink (one-time setup)
php artisan storage:link

# Run migrations
php artisan migrate

# Seed car images
php artisan db:seed --class=CarImageSeeder

# Fresh migration with all data
php artisan migrate:fresh --seed
```

**Expected Output:**

```bash
✓ Seeded 400 car images for 80 cars
  - Primary images: 80
  - Total images: 400
```

### Verify Data

```bash
php artisan tinker
>>> CarImage::count()
=> 400

>>> CarImage::where('is_primary', true)->count()
=> 80 # Should match car count

>>> $car = Car::first()
>>> $car->images()->count()
=> 5

>>> $car->primaryImage->url
=> "http://localhost/storage/cars/1/abc123.jpg"
```

### Verify Primary Image Logic

```bash
>>> $car = Car::first()
>>> $car->images()->where('is_primary', true)->count()
=> 1 # Only one primary image

>>> $secondImage = $car->images->skip(1)->first()
>>> $secondImage->setPrimary()

>>> $car->fresh()->images()->where('is_primary', true)->count()
=> 1 # Still only one primary
```

---

## Frontend Integration (Example)

### React Gallery Component

**File:** `resources/js/components/car-gallery.tsx`

```tsx
import { useState } from 'react';
import { CarImage } from '@/types/models/car-image';

interface CarGalleryProps {
  images: CarImage[];
}

export function CarGallery({ images }: CarGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(
    images.find(img => img.is_primary) || images[0]
  );

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt_text || 'Car image'}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-5 gap-2">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className={`
              aspect-video overflow-hidden rounded border-2 transition-colors
              ${selectedImage.id === image.id ? 'border-primary' : 'border-gray-200'}
            `}
          >
            <img
              src={image.url}
              alt={image.alt_text || 'Thumbnail'}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## Next Steps

After completing this setup:

1. ✅ Car images system is ready with gallery support
2. ✅ All car-related tables completed (brands, categories, cars, images)
3. ➡️ Build Admin CRUD controllers for cars
4. ➡️ Create Frontend car listing and detail pages
5. ➡️ Implement booking system (next major feature)

**Integration Complete:** Car rental inventory system is fully operational with master data, car management, and image gallery functionality.
