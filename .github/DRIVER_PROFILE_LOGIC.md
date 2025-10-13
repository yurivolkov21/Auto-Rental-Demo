# Driver Profile Auto-Management Logic

## Overview
When admin changes a user's role to/from "driver", the system automatically manages their `DriverProfile` record to preserve historical data while controlling access.

## Behavior

### 1. Promoting to Driver Role (`role` → `driver`)

**Case A: First-time driver**
```php
User has no DriverProfile → Create new profile
- status: 'off_duty'
- is_available_for_booking: false
- All fees: 0.00
- Performance metrics: 0
```

**Case B: Returning driver (was driver before)**
```php
User has existing DriverProfile → Reactivate (preserves history)
- status: 'off_duty' 
- is_available_for_booking: false
- Keeps: rating, trips, km, hours, fees
```

### 2. Demoting from Driver Role (`driver` → other role)

```php
DriverProfile is NOT deleted → Deactivate only
- status: 'off_duty'
- is_available_for_booking: false
- All historical data preserved
```

### 3. Driver Profiles Index Page

```php
// Only shows users with current role='driver'
DriverProfile::whereHas('user', fn($q) => $q->where('role', 'driver'))
```

## Data Flow

```
User Management → Change Role → Driver Profile
     ↓                 ↓               ↓
  role='driver'   Auto-create    status='off_duty'
                  or reactive    available=false
                                      ↓
                              Admin edits profile
                              (fees, schedule, etc.)
                                      ↓
                              Admin activates
                              status='available'
                              available=true
```

## Database Sync

All fields match `database/migrations/2025_10_11_000000_create_driver_profiles_table.php`:

- `user_id` (FK, unique)
- `owner_id` (FK, nullable)
- Pricing: `hourly_fee`, `daily_fee`, `overtime_fee_per_hour`, `daily_hour_threshold`
- Status: `status` (enum), `working_hours` (json), `is_available_for_booking`
- Metrics: `completed_trips`, `average_rating`, `total_km_driven`, `total_hours_driven`

## Files Modified

- `app/Http/Controllers/Admin/UserController.php` - `changeRole()` method
- `app/Http/Controllers/Admin/DriverProfileController.php` - `index()` query filter
