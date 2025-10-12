# Car Images Management - Setup Guide

## Overview

Image gallery system cho cars với support primary image, ordering, và storage management. Mỗi car có thể có nhiều images, trong đó 1 image là primary (hiển thị chính).

**Dependencies**: `cars` table

---

## 1. Database Schema

Migration đã được tạo tại `database/migrations/2025_10_10_000000_create_car_images_table.php`

**Key Features**:
- Multiple images per car (1-to-many)
- Primary image flag (is_primary)
- Custom sort order
- Alt text for SEO
- Cascade delete when car deleted

---

## 2. Model Setup

### CarImage Model

**File**: `app/Models/CarImage.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Relationships
    public function car()
    {
        return $this->belongsTo(Car::class);
    }

    // Scopes
    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at');
    }

    // Helpers
    public function setPrimary(): void
    {
        // Unset other primary images for this car
        self::where('car_id', $this->car_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Set this as primary
        $this->update(['is_primary' => true]);
    }

    public function getFullUrlAttribute(): string
    {
        return asset('storage/' . $this->image_path);
    }
}
```

---

## 3. Factory Setup

### CarImageFactory

**File**: `database/factories/CarImageFactory.php`

```php
<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class CarImageFactory extends Factory
{
    protected $model = CarImage::class;

    public function definition(): array
    {
        return [
            'car_id' => Car::factory(),
            'image_path' => fake()->imageUrl(800, 600, 'transport'),
            'alt_text' => fake()->optional()->sentence(5),
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
}
```

---

## 4. Seeder Setup

### CarImageSeeder

**File**: `database/seeders/CarImageSeeder.php`

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
        
        foreach ($cars as $car) {
            // Create 1 primary image
            CarImage::factory()->primary()->create([
                'car_id' => $car->id,
                'alt_text' => "{$car->brand->name} {$car->model} - Main view",
            ]);

            // Create 3-6 additional images
            $additionalImages = rand(3, 6);
            for ($i = 1; $i <= $additionalImages; $i++) {
                CarImage::factory()->create([
                    'car_id' => $car->id,
                    'is_primary' => false,
                    'sort_order' => $i,
                    'alt_text' => "{$car->brand->name} {$car->model} - View {$i}",
                ]);
            }
        }

        $this->command->info('✓ Seeded ' . CarImage::count() . ' car images');
    }
}
```

---

## 5. Storage Configuration

**File**: `config/filesystems.php` (verify these settings exist)

```php
'disks' => [
    'public' => [
        'driver' => 'local',
        'root' => storage_path('app/public'),
        'url' => env('APP_URL').'/storage',
        'visibility' => 'public',
    ],
],
```

**Create symlink**:
```bash
php artisan storage:link
```

---

## 6. Image Upload Controller

**File**: `app/Http/Controllers/CarImageController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarImageController extends Controller
{
    public function store(Request $request, Car $car)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // 5MB max
            'alt_text' => 'nullable|string|max:255',
            'is_primary' => 'boolean',
        ]);

        // Upload image
        $path = $request->file('image')->store('cars/' . $car->id, 'public');

        // Create image record
        $image = CarImage::create([
            'car_id' => $car->id,
            'image_path' => $path,
            'alt_text' => $request->alt_text,
            'is_primary' => $request->is_primary ?? false,
            'sort_order' => CarImage::where('car_id', $car->id)->max('sort_order') + 1,
        ]);

        // If primary, unset others
        if ($image->is_primary) {
            $image->setPrimary();
        }

        return back()->with('success', 'Image uploaded successfully');
    }

    public function destroy(CarImage $image)
    {
        // Delete file from storage
        Storage::disk('public')->delete($image->image_path);

        // Delete record
        $image->delete();

        return back()->with('success', 'Image deleted successfully');
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

        foreach ($request->images as $imageData) {
            CarImage::where('id', $imageData['id'])
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return back()->with('success', 'Images reordered successfully');
    }
}
```

---

## 7. Usage Examples

### Get Car with Images

```php
// Get car with all images ordered
$car = Car::with(['images' => function($query) {
    $query->ordered();
}])->find(1);

// Get primary image only
$car = Car::with('primaryImage')->find(1);
$primaryUrl = $car->primaryImage?->image_path;
```

### Upload & Manage Images

```php
// Upload new image
$image = CarImage::create([
    'car_id' => $carId,
    'image_path' => $path,
    'is_primary' => false,
    'sort_order' => 1,
]);

// Set as primary
$image->setPrimary();

// Delete with file cleanup
Storage::disk('public')->delete($image->image_path);
$image->delete();
```

### Frontend Gallery Component (React)

```tsx
// Example: Car Image Gallery
interface CarImageGalleryProps {
    images: CarImage[];
    primaryImage?: CarImage;
}

export default function CarImageGallery({ images, primaryImage }: CarImageGalleryProps) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {/* Primary Image - Large */}
            {primaryImage && (
                <div className="col-span-4">
                    <img 
                        src={primaryImage.image_path} 
                        alt={primaryImage.alt_text}
                        className="w-full h-96 object-cover rounded-lg"
                    />
                </div>
            )}
            
            {/* Other Images - Thumbnails */}
            {images.filter(img => !img.is_primary).map((image) => (
                <div key={image.id}>
                    <img 
                        src={image.image_path}
                        alt={image.alt_text}
                        className="w-full h-24 object-cover rounded"
                    />
                </div>
            ))}
        </div>
    );
}
```

---

## 8. Routes

**File**: `routes/web.php` or `routes/admin.php`

```php
// Car image management routes
Route::middleware(['auth'])->group(function () {
    Route::post('cars/{car}/images', [CarImageController::class, 'store']);
    Route::delete('car-images/{image}', [CarImageController::class, 'destroy']);
    Route::patch('car-images/{image}/set-primary', [CarImageController::class, 'setPrimary']);
    Route::patch('cars/{car}/images/reorder', [CarImageController::class, 'reorder']);
});
```

---

## 9. Run Setup

```bash
# Create storage symlink
php artisan storage:link

# Run seeders
php artisan db:seed --class=CarImageSeeder

# Test upload permissions
chmod -R 775 storage/app/public
```

**Expected Output:**
```
✓ Seeded 400 car images (80 cars × 4-7 images each)
```
