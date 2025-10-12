# Promotion Management - Setup Guide

**Document Version:** 1.0  
**Last Updated:** October 11, 2025  
**Status:** 📋 Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the Promotion Management system for the AutoRental car rental platform. It covers Model configuration, Factory setup, Seeder implementation, and Admin Panel design guidelines following the established design system.

## Table of Contents

1. [Database Migration](#database-migration)
2. [Model Configuration](#model-configuration)
3. [Factory Setup](#factory-setup)
4. [Seeder Implementation](#seeder-implementation)
5. [Admin Panel Design Guidelines](#admin-panel-design-guidelines)
6. [Controller & Request Validation](#controller--request-validation)
7. [Frontend Implementation](#frontend-implementation)
8. [Testing Strategy](#testing-strategy)

---

## Database Migration

### Schema Overview

The `promotions` table has been designed with the following structure:

**Key Features:**
- 19 fields covering all promotion aspects
- Foreign key to `users` table for audit trail
- 5 performance-optimized indexes
- Follows project conventions (decimal precision, enum types, boolean flags)

**Field Categories:**

1. **Basic Information:** `code`, `name`, `description`
2. **Discount Configuration:** `discount_type`, `discount_value`, `max_discount`
3. **Requirements:** `min_amount`, `min_rental_hours`
4. **Usage Limits:** `max_uses`, `max_uses_per_user`, `used_count`
5. **Validity Period:** `start_date`, `end_date`
6. **Status & Features:** `status`, `is_auto_apply`, `is_featured`, `priority`
7. **Audit Trail:** `created_by`, `created_at`, `updated_at`

### Running Migration

```bash
# Run migration
php artisan migrate

# Rollback if needed
php artisan migrate:rollback

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

---

## Model Configuration

### File: `app/Models/Promotion.php`

Create the Promotion model with proper configuration:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Promotion extends Model
{
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_amount',
        'min_rental_hours',
        'max_uses',
        'max_uses_per_user',
        'used_count',
        'start_date',
        'end_date',
        'status',
        'is_auto_apply',
        'is_featured',
        'priority',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_amount' => 'decimal:2',
        'min_rental_hours' => 'integer',
        'max_uses' => 'integer',
        'max_uses_per_user' => 'integer',
        'used_count' => 'integer',
        'priority' => 'integer',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_auto_apply' => 'boolean',
        'is_featured' => 'boolean',
    ];

    /**
     * Get the admin who created this promotion.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if promotion is expired based on end_date.
     */
    public function isExpired(): bool
    {
        return $this->end_date < now();
    }

    /**
     * Check if promotion is currently valid.
     */
    public function isValid(): bool
    {
        return $this->status === 'active'
            && $this->start_date <= now()
            && $this->end_date >= now();
    }

    /**
     * Check if promotion has reached usage limit.
     */
    public function hasReachedLimit(): bool
    {
        if ($this->max_uses === null) {
            return false; // Unlimited uses
        }
        
        return $this->used_count >= $this->max_uses;
    }

    /**
     * Check if user can use this promotion.
     */
    public function canBeUsedBy(User $user): bool
    {
        // Count how many times user has used this promotion
        // This requires promotion_usages tracking (future enhancement)
        // For now, we'll assume it's available
        return true;
    }

    /**
     * Calculate discount amount for given rental amount.
     */
    public function calculateDiscount(float $rentalAmount): float
    {
        if ($this->discount_type === 'percentage') {
            $discount = $rentalAmount * ($this->discount_value / 100);
            
            // Apply max_discount cap if set
            if ($this->max_discount !== null && $discount > $this->max_discount) {
                return $this->max_discount;
            }
            
            return $discount;
        }
        
        // Fixed amount discount
        return min($this->discount_value, $rentalAmount);
    }

    /**
     * Scope: Get only active promotions.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('start_date', '<=', now())
                     ->where('end_date', '>=', now());
    }

    /**
     * Scope: Get featured promotions.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Get auto-apply promotions.
     */
    public function scopeAutoApply($query)
    {
        return $query->where('is_auto_apply', true);
    }

    /**
     * Scope: Order by priority (lower number = higher priority).
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'asc');
    }

    /**
     * Scope: Search by code or name.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
              ->orWhere('name', 'like', "%{$search}%");
        });
    }
}
```

### Key Model Features

1. **Fillable Fields:** All 17 promotion fields
2. **Casts:** Proper type casting for decimals, integers, dates, booleans
3. **Relationships:** BelongsTo relationship with User (creator)
4. **Helper Methods:**
   - `isExpired()` - Check if past end_date
   - `isValid()` - Check if active and within date range
   - `hasReachedLimit()` - Check usage limits
   - `calculateDiscount()` - Calculate discount amount
5. **Query Scopes:**
   - `active()` - Only valid active promotions
   - `featured()` - Featured promotions
   - `autoApply()` - Auto-apply promotions
   - `byPriority()` - Order by priority
   - `search()` - Search by code or name

---

## Factory Setup

### File: `database/factories/PromotionFactory.php`

Create realistic test data for promotions:

```php
<?php

namespace Database\Factories;

use App\Models\Promotion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        $discountType = fake()->randomElement(['percentage', 'fixed_amount']);
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $endDate = Carbon::parse($startDate)->addDays(fake()->numberBetween(7, 90));

        return [
            // Basic Information
            'code' => strtoupper(fake()->unique()->bothify('??###')),
            'name' => fake()->randomElement([
                'Summer Sale',
                'Weekend Special',
                'New Customer Discount',
                'Holiday Promo',
                'Flash Sale',
                'Early Bird Special',
                'Last Minute Deal',
            ]) . ' ' . fake()->numberBetween(2024, 2025),
            'description' => fake()->optional()->sentence(),

            // Discount Configuration
            'discount_type' => $discountType,
            'discount_value' => $discountType === 'percentage' 
                ? fake()->numberBetween(5, 50) 
                : fake()->numberBetween(50000, 500000),
            'max_discount' => $discountType === 'percentage' 
                ? fake()->numberBetween(100000, 1000000) 
                : null,

            // Requirements
            'min_amount' => fake()->randomElement([0, 500000, 1000000, 2000000]),
            'min_rental_hours' => fake()->randomElement([4, 12, 24, 48]),

            // Usage Limits
            'max_uses' => fake()->optional(0.7)->numberBetween(10, 1000),
            'max_uses_per_user' => fake()->numberBetween(1, 3),
            'used_count' => fake()->numberBetween(0, 50),

            // Validity Period
            'start_date' => $startDate,
            'end_date' => $endDate,

            // Status & Features
            'status' => fake()->randomElement(['active', 'paused', 'upcoming']),
            'is_auto_apply' => fake()->boolean(20), // 20% chance true
            'is_featured' => fake()->boolean(30), // 30% chance true
            'priority' => fake()->numberBetween(0, 10),

            // Audit Trail
            'created_by' => User::where('role', 'admin')->inRandomOrder()->first()?->id,
        ];
    }

    /**
     * Create an active promotion.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(30),
        ]);
    }

    /**
     * Create a featured promotion.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_featured' => true,
            'priority' => fake()->numberBetween(0, 3),
        ]);
    }

    /**
     * Create an auto-apply promotion.
     */
    public function autoApply(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_auto_apply' => true,
            'priority' => 0, // Highest priority
        ]);
    }

    /**
     * Create a percentage discount promotion.
     */
    public function percentage(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'percentage',
            'discount_value' => fake()->numberBetween(10, 30),
            'max_discount' => fake()->numberBetween(200000, 500000),
        ]);
    }

    /**
     * Create a fixed amount discount promotion.
     */
    public function fixedAmount(): static
    {
        return $this->state(fn (array $attributes) => [
            'discount_type' => 'fixed_amount',
            'discount_value' => fake()->numberBetween(100000, 300000),
            'max_discount' => null,
        ]);
    }

    /**
     * Create an expired promotion.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subMonths(2),
            'end_date' => now()->subDays(5),
            'status' => 'active', // Status still active but expired by date
        ]);
    }
}
```

### Factory Features

1. **Realistic Data:**
   - Codes: 2 letters + 3 numbers (e.g., "AB123")
   - Names: Common promotion names with year
   - Discount values: Appropriate ranges for VN market

2. **State Methods:**
   - `active()` - Currently valid promotions
   - `featured()` - Featured with high priority
   - `autoApply()` - Auto-apply promotions
   - `percentage()` - Percentage discounts
   - `fixedAmount()` - Fixed amount discounts
   - `expired()` - Past promotions for testing

3. **Business Logic:**
   - Percentage discounts have max_discount cap
   - Fixed amount discounts don't need max_discount
   - Realistic date ranges (7-90 days)
   - Vietnamese currency amounts (VND)

---

## Seeder Implementation

### File: `database/seeders/DatabaseSeeder.php`

Add promotion seeding to existing seeder:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ... existing user seeding code ...

        // Seed Promotions (after users are created)
        $this->seedPromotions();
    }

    /**
     * Seed promotion data.
     */
    private function seedPromotions(): void
    {
        $adminUser = User::where('role', 'admin')->first();

        // 1. Featured Active Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->active()
            ->featured()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 2. Auto-apply Promotions (3 promotions)
        Promotion::factory()
            ->count(3)
            ->active()
            ->autoApply()
            ->percentage()
            ->create([
                'created_by' => $adminUser?->id,
                'is_featured' => true,
                'min_amount' => 1000000, // 1M VND minimum
            ]);

        // 3. Regular Active Promotions (10 promotions)
        Promotion::factory()
            ->count(10)
            ->active()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 4. Upcoming Promotions (5 promotions)
        Promotion::factory()
            ->count(5)
            ->create([
                'status' => 'upcoming',
                'start_date' => now()->addDays(5),
                'end_date' => now()->addDays(35),
                'created_by' => $adminUser?->id,
            ]);

        // 5. Paused Promotions (3 promotions)
        Promotion::factory()
            ->count(3)
            ->create([
                'status' => 'paused',
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(25),
                'created_by' => $adminUser?->id,
            ]);

        // 6. Expired Promotions (4 promotions) - for testing
        Promotion::factory()
            ->count(4)
            ->expired()
            ->create([
                'created_by' => $adminUser?->id,
            ]);

        // 7. Specific Example Promotions
        Promotion::create([
            'code' => 'WELCOME10',
            'name' => 'Welcome New Customer',
            'description' => 'First rental discount for new customers',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'max_discount' => 200000,
            'min_amount' => 500000,
            'min_rental_hours' => 24,
            'max_uses' => null, // Unlimited
            'max_uses_per_user' => 1,
            'used_count' => 0,
            'start_date' => now()->subDays(10),
            'end_date' => now()->addMonths(6),
            'status' => 'active',
            'is_auto_apply' => false,
            'is_featured' => true,
            'priority' => 1,
            'created_by' => $adminUser?->id,
        ]);

        Promotion::create([
            'code' => 'WEEKEND50',
            'name' => 'Weekend Special',
            'description' => '50,000 VND off for weekend rentals',
            'discount_type' => 'fixed_amount',
            'discount_value' => 50000,
            'max_discount' => null,
            'min_amount' => 0,
            'min_rental_hours' => 12,
            'max_uses' => 500,
            'max_uses_per_user' => 2,
            'used_count' => 123,
            'start_date' => now()->subDays(15),
            'end_date' => now()->addDays(45),
            'status' => 'active',
            'is_auto_apply' => true,
            'is_featured' => true,
            'priority' => 0, // Highest priority
            'created_by' => $adminUser?->id,
        ]);

        $this->command->info('✓ Seeded ' . Promotion::count() . ' promotions');
    }
}
```

### Seeding Strategy

**Total Promotions:** ~32 promotions

1. **5 Featured Active** - Homepage display
2. **3 Auto-apply** - Automatic discounts
3. **10 Regular Active** - Standard promotions
4. **5 Upcoming** - Scheduled future promotions
5. **3 Paused** - Temporarily disabled
6. **4 Expired** - Historical data
7. **2 Specific Examples** - WELCOME10, WEEKEND50

**Run Seeder:**

```bash
php artisan db:seed
# or
php artisan migrate:fresh --seed
```

---

## Admin Panel Design Guidelines

### Design System Compliance

Follow the established admin panel design system from Verification and Location Management:

### 1. **Stats Cards (4 cards)**

```typescript
interface StatsCardData {
    title: string;
    value: number;
    subtitle: string;
    icon: LucideIcon;
    color: string;
}

const statsCards = [
    {
        title: 'Total Promotions',
        value: stats.total,
        subtitle: 'All promotional offers',
        icon: Tag,
        color: 'text-blue-600'
    },
    {
        title: 'Active Promotions',
        value: stats.active,
        subtitle: `${percentage}% currently valid`,
        icon: CheckCircle,
        color: 'text-green-600'
    },
    {
        title: 'Featured Promotions',
        value: stats.featured,
        subtitle: 'Highlighted on homepage',
        icon: Star,
        color: 'text-orange-600'
    },
    {
        title: 'Total Usage',
        value: stats.total_uses,
        subtitle: 'Times promotions applied',
        icon: TrendingUp,
        color: 'text-purple-600'
    }
];
```

**Card Layout:**
- `h-[68px]` on CardHeader for alignment
- `hover:shadow-md transition-shadow` effect
- Value: `text-2xl font-bold`
- Subtitle: `text-xs text-muted-foreground mt-1`

### 2. **Page Layouts**

#### **Index Page Pattern:**
```
Header (Title + Add Button)
  ↓
Stats Cards (4 cards, md:grid-cols-4)
  ↓
Card Container
  ├─ Filters Row (Search + Status + Type)
  ├─ Table (hover effects)
  └─ Pagination
```

#### **Create/Edit Page Pattern:**
```
Header (Back button + Title)
  ↓
Form (lg:grid-cols-3)
  ├─ Main Content (lg:col-span-2)
  │   ├─ Basic Information Card
  │   ├─ Discount Configuration Card
  │   ├─ Requirements Card
  │   ├─ Usage Limits Card
  │   └─ Validity Period Card
  │
  └─ Sidebar (lg:col-span-1)
      ├─ Settings Card (status, features)
      └─ Preview Card (discount calculation)
```

#### **Show Page Pattern:**
```
Header (Back button + Title + Actions)
  ↓
Content (lg:grid-cols-3)
  ├─ Main (lg:col-span-2)
  │   ├─ Status & Type Card
  │   ├─ Discount Details Card
  │   ├─ Requirements Card
  │   └─ Usage Statistics Card
  │
  └─ Sidebar (lg:col-span-1)
      ├─ Validity Period Card
      └─ Meta Information Card
```

### 3. **Header Patterns**

```tsx
// Index Page Header
<div className="flex items-center justify-between">
    <div>
        <h1 className="text-3xl font-bold tracking-tight">
            Promotion Management
        </h1>
        <p className="text-muted-foreground">
            Manage discount codes and promotional offers
        </p>
    </div>
    <Button asChild>
        <Link href="/admin/promotions/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Promotion
        </Link>
    </Button>
</div>

// Create/Edit/Show Page Header
<div className="flex items-center gap-3">
    <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/promotions">
            <ChevronLeft className="h-5 w-5" />
        </Link>
    </Button>
    <div>
        <h1 className="text-2xl font-bold tracking-tight">
            {title}
        </h1>
        <p className="text-sm text-muted-foreground">
            {subtitle}
        </p>
    </div>
</div>
```

### 4. **Table Design**

```tsx
<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Usage</TableHead>
            <TableHead>Valid Period</TableHead>
            <TableHead className="text-right">Actions</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        {promotions.map((promotion) => (
            <TableRow key={promotion.id} className="hover:bg-muted/50">
                <TableCell className="font-mono">{promotion.code}</TableCell>
                <TableCell className="font-medium">{promotion.name}</TableCell>
                <TableCell>
                    {promotion.discount_type === 'percentage' 
                        ? `${promotion.discount_value}%`
                        : formatCurrency(promotion.discount_value)}
                </TableCell>
                <TableCell>
                    <Badge variant="outline">{promotion.discount_type}</Badge>
                </TableCell>
                <TableCell>{/* Status badge */}</TableCell>
                <TableCell>{/* Usage count */}</TableCell>
                <TableCell>{/* Date range */}</TableCell>
                <TableCell className="text-right">
                    {/* Action buttons: Eye, Edit, Trash2 */}
                </TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

### 5. **Badge Colors**

```tsx
// Status Badges
const statusBadges = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    upcoming: 'bg-blue-100 text-blue-800',
    expired: 'bg-gray-100 text-gray-800', // Calculated from end_date
};

// Type Badges
const typeBadges = {
    percentage: 'bg-purple-50 text-purple-700 border-purple-200',
    fixed_amount: 'bg-blue-50 text-blue-700 border-blue-200',
};

// Feature Badges
<Badge variant="outline" className="bg-orange-50 text-orange-700">
    <Star className="mr-1 h-3 w-3" />
    Featured
</Badge>
```

### 6. **Icons (lucide-react)**

```typescript
// Standard icons across promotion pages
import {
    Tag,           // Promotions main icon
    CheckCircle,   // Active status
    Star,          // Featured
    TrendingUp,    // Usage/statistics
    Plus,          // Create new
    Eye,           // View details
    Edit,          // Edit promotion
    Trash2,        // Delete
    ChevronLeft,   // Back button
    Clock,         // Date/time
    Percent,       // Percentage discount
    DollarSign,    // Fixed amount discount
    Users,         // User limits
    Calendar,      // Date range
} from 'lucide-react';
```

### 7. **Form Components**

```tsx
// Discount Type Radio Group
<RadioGroup value={data.discount_type} onValueChange={(value) => setData('discount_type', value)}>
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="percentage" id="percentage" />
        <Label htmlFor="percentage">
            <Percent className="inline h-4 w-4 mr-1" />
            Percentage
        </Label>
    </div>
    <div className="flex items-center space-x-2">
        <RadioGroupItem value="fixed_amount" id="fixed_amount" />
        <Label htmlFor="fixed_amount">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Fixed Amount
        </Label>
    </div>
</RadioGroup>

// Date Range Picker
<div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
            id="start_date"
            type="datetime-local"
            value={formatDateTimeLocal(data.start_date)}
            onChange={(e) => setData('start_date', e.target.value)}
        />
    </div>
    <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input
            id="end_date"
            type="datetime-local"
            value={formatDateTimeLocal(data.end_date)}
            onChange={(e) => setData('end_date', e.target.value)}
        />
    </div>
</div>

// Feature Checkboxes
<div className="space-y-2">
    <div className="flex items-center space-x-2">
        <Checkbox
            id="is_auto_apply"
            checked={data.is_auto_apply}
            onCheckedChange={(checked) => setData('is_auto_apply', checked)}
        />
        <Label htmlFor="is_auto_apply">Auto-apply</Label>
    </div>
    <p className="text-xs text-muted-foreground">
        Automatically apply without requiring code input
    </p>
</div>
```

### 8. **Dialogs**

```tsx
// Delete Confirmation Dialog
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete <strong>{promotion.code}</strong>?
                <span className="block mt-2 text-red-600 font-medium">
                    This action cannot be undone. All promotion data will be permanently removed.
                </span>
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
                Delete
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

// Toggle Status Dialog
<Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>
                {promotion.status === 'active' ? 'Pause' : 'Activate'} Promotion
            </DialogTitle>
            <DialogDescription>
                Are you sure you want to {promotion.status === 'active' ? 'pause' : 'activate'}{' '}
                <strong>{promotion.code}</strong>?
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button variant="outline" onClick={() => setToggleDialogOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleToggleStatus}>
                {promotion.status === 'active' ? 'Pause' : 'Activate'}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

---

## Controller & Request Validation

### Controller: `app/Http/Controllers/Admin/PromotionController.php`

```php
<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Promotion;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\PromotionStoreRequest;
use App\Http\Requests\Admin\PromotionUpdateRequest;

class PromotionController extends Controller
{
    /**
     * Display a listing of promotions.
     */
    public function index(Request $request): Response
    {
        $query = Promotion::query()
            ->with('creator')
            ->orderBy('priority')
            ->orderBy('start_date', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('discount_type', $request->type);
        }

        // Search by code or name
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        $promotions = $query->paginate(15)->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => Promotion::count(),
            'active' => Promotion::where('status', 'active')->count(),
            'featured' => Promotion::where('is_featured', true)->count(),
            'total_uses' => Promotion::sum('used_count'),
        ];

        return Inertia::render('admin/promotions/index', [
            'promotions' => $promotions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'type' => $request->type ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new promotion.
     */
    public function create(): Response
    {
        return Inertia::render('admin/promotions/create');
    }

    /**
     * Store a newly created promotion.
     */
    public function store(PromotionStoreRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();

            Promotion::create($data);

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create promotion. Please try again.');
        }
    }

    /**
     * Display the specified promotion.
     */
    public function show(Promotion $promotion): Response
    {
        $promotion->load('creator');

        return Inertia::render('admin/promotions/show', [
            'promotion' => $promotion,
        ]);
    }

    /**
     * Show the form for editing the specified promotion.
     */
    public function edit(Promotion $promotion): Response
    {
        return Inertia::render('admin/promotions/edit', [
            'promotion' => $promotion,
        ]);
    }

    /**
     * Update the specified promotion.
     */
    public function update(PromotionUpdateRequest $request, Promotion $promotion): RedirectResponse
    {
        try {
            $data = $request->validated();
            $promotion->update($data);

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update promotion. Please try again.');
        }
    }

    /**
     * Remove the specified promotion.
     */
    public function destroy(Promotion $promotion): RedirectResponse
    {
        try {
            $promotion->delete();

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete promotion. Please try again.');
        }
    }

    /**
     * Toggle promotion status.
     */
    public function toggleStatus(Promotion $promotion): RedirectResponse
    {
        try {
            $newStatus = $promotion->status === 'active' ? 'paused' : 'active';
            $promotion->update(['status' => $newStatus]);

            $message = $newStatus === 'active' 
                ? 'Promotion activated successfully.' 
                : 'Promotion paused successfully.';

            return redirect()
                ->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to toggle promotion status. Please try again.');
        }
    }
}
```

### Request Validation

#### PromotionStoreRequest

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PromotionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Relies on middleware
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:promotions,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0', 'max:100000000'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_amount' => ['nullable', 'numeric', 'min:0'],
            'min_rental_hours' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'in:active,paused,upcoming'],
            'is_auto_apply' => ['boolean'],
            'is_featured' => ['boolean'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
```

#### PromotionUpdateRequest

```php
<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Promotion;

/**
 * @method Promotion route(string $param)
 */
class PromotionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Relies on middleware
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', 'unique:promotions,code,' . $this->route('promotion')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0', 'max:100000000'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_amount' => ['nullable', 'numeric', 'min:0'],
            'min_rental_hours' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_user' => ['nullable', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'status' => ['required', 'in:active,paused,upcoming'],
            'is_auto_apply' => ['boolean'],
            'is_featured' => ['boolean'],
            'priority' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
```

---

## Frontend Implementation

### TypeScript Types

**File:** `resources/js/types/index.d.ts`

```typescript
interface Promotion {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: string;
    max_discount: string | null;
    min_amount: string;
    min_rental_hours: number;
    max_uses: number | null;
    max_uses_per_user: number;
    used_count: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'paused' | 'upcoming';
    is_auto_apply: boolean;
    is_featured: boolean;
    priority: number;
    created_by: number | null;
    creator?: User;
    created_at: string;
    updated_at: string;
}
```

### Routes Configuration

**File:** `routes/admin.php`

```php
Route::prefix('promotions')->group(function () {
    Route::get('/', [PromotionController::class, 'index'])
        ->name('admin.promotions.index');
    Route::get('/create', [PromotionController::class, 'create'])
        ->name('admin.promotions.create');
    Route::post('/', [PromotionController::class, 'store'])
        ->name('admin.promotions.store');
    Route::get('/{promotion}', [PromotionController::class, 'show'])
        ->name('admin.promotions.show');
    Route::get('/{promotion}/edit', [PromotionController::class, 'edit'])
        ->name('admin.promotions.edit');
    Route::put('/{promotion}', [PromotionController::class, 'update'])
        ->name('admin.promotions.update');
    Route::delete('/{promotion}', [PromotionController::class, 'destroy'])
        ->name('admin.promotions.destroy');
    Route::post('/{promotion}/toggle-status', [PromotionController::class, 'toggleStatus'])
        ->name('admin.promotions.toggle-status');
});
```

---

## Testing Strategy

### Unit Tests

**Test Model Methods:**

```php
test('calculates percentage discount correctly')
test('calculates fixed amount discount correctly')
test('applies max discount cap for percentage')
test('checks if promotion is expired')
test('checks if promotion is valid')
test('checks if promotion has reached limit')
```

### Feature Tests

**Test Controller Actions:**

```php
test('admin can view promotions list')
test('admin can create promotion')
test('admin can update promotion')
test('admin can delete promotion')
test('admin can toggle promotion status')
test('promotion code must be unique')
test('end date must be after start date')
test('discount value validation works correctly')
```

---

## Deployment Checklist

- ✅ Run migration: `php artisan migrate`
- ✅ Seed promotions: `php artisan db:seed`
- ✅ Clear cache: `php artisan optimize:clear`
- ✅ Compile frontend: `npm run build`
- ✅ Verify admin middleware active
- ✅ Test all CRUD operations
- ✅ Verify validation rules working
- ✅ Test toast notifications
- ✅ Check responsive design
- ✅ Test filter and search functionality

---

## Conclusion

This setup guide provides all necessary code and configurations to implement a complete Promotion Management system following the established design patterns. The system is ready for admin panel integration with proper validation, error handling, and consistent UI/UX.

**Key Features:**
- ✅ Complete Model with scopes and helper methods
- ✅ Factory with realistic Vietnamese data
- ✅ Seeder with 32+ diverse promotions
- ✅ Controller with full CRUD operations
- ✅ Request validation matching migration schema
- ✅ Admin panel design guidelines
- ✅ TypeScript type definitions
- ✅ Testing strategy outline

**Document Word Count:** ~2,400 words
