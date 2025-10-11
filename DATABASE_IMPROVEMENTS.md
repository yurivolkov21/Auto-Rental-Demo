# 📝 Database Schema Improvements - User & UserVerification Tables (#1)

## 📅 Date: October 11, 2025

## 🎯 Summary of Changes

Optimized 2 core database tables with improved data types, indexes, audit trails, and constraints for better performance and data integrity.

---

## 1️⃣ USERS TABLE (`2025_10_03_000000_create_users_table.php`)

### ✨ New Fields Added:
- **`status`**: `enum('active', 'inactive', 'suspended', 'banned')` - Account status management

### 🔧 Modified Fields:
| Field | Before | After | Reason |
|-------|--------|-------|--------|
| `avatar` | `string(500)` | `text` | Support longer cloud storage URLs |
| `phone` | `string(20) unique` | `string(20)` (indexed) | Avoid nullable + unique conflicts |
| `role` | `['customer','driver','admin']` | `['customer','owner','admin']` | Match business requirements |

### 📊 New Indexes:
```php
$table->index('role');
$table->index('status');
$table->index(['provider', 'provider_id']);
$table->index('deleted_at');
$table->index('phone');
$table->unique(['provider', 'provider_id'], 'oauth_unique');
```

### 🎯 Benefits:
- ✅ Faster role-based queries (admin dashboards)
- ✅ OAuth provider uniqueness enforced
- ✅ Soft delete queries optimized
- ✅ Account status management enabled

---

## 2️⃣ USER_VERIFICATIONS TABLE (`2025_10_04_000000_create_user_verifications_table.php`)

### ✨ New Fields Added:
- **`license_type`**: `string(20)` - License category (A1, A2, B1, B2, C, D, E)
- **`nationality`**: `string(100)` - User's nationality
- **`verified_by`**: `foreignId` → `users.id` - Admin who verified
- **`rejected_by`**: `foreignId` → `users.id` - Admin who rejected
- **`rejected_at`**: `timestamp` - Rejection timestamp

### 🔧 Modified Fields:
| Field | Before | After | Reason |
|-------|--------|-------|--------|
| `driving_license_image` | `string(500)` | `text` | Support longer URLs |
| `id_image` | `string(500)` | `text` | Support longer URLs |
| `selfie_image` | `string(500)` | `text` | Support longer URLs |
| `status` | `enum('pending','verified','rejected')` | Added `'expired'` | Handle expired licenses |

### 📊 New Constraints & Indexes:
```php
$table->unique('user_id'); // One user = one verification record
$table->index('status');   // Fast filtering by status
```

### 🎯 Benefits:
- ✅ Complete audit trail (who verified/rejected + when)
- ✅ Prevent duplicate verification records
- ✅ Faster status-based queries (admin filtering)
- ✅ Better document management
- ✅ License type tracking for booking restrictions

---

## 3️⃣ MODEL UPDATES

### 📄 `app/Models/User.php`
**Updated `$fillable`:**
```php
'provider', 'provider_id', 'avatar', 'bio', 'phone',
'address', 'date_of_birth', 'role', 'status',
'deletion_reason', 'deletion_requested_at', 'deleted_at'
```

**Updated `$casts`:**
```php
'two_factor_confirmed_at' => 'datetime',
'date_of_birth' => 'date',
'deletion_requested_at' => 'datetime',
'deleted_at' => 'datetime',
```

**New Relationship:**
```php
public function verification() {
    return $this->hasOne(UserVerification::class);
}
```

### 📄 `app/Models/UserVerification.php` (NEW)
**Complete model with:**
- All fillable fields matching migration
- Proper date casting
- 3 relationships: `user()`, `verifier()`, `rejector()`

---

## 4️⃣ TYPESCRIPT TYPES

### 📄 `resources/js/types/index.d.ts`
**Updated `User` interface:**
- All new fields with proper types
- Role: `'customer' | 'owner' | 'admin'`
- Status: `'active' | 'inactive' | 'suspended' | 'banned'`

**New `UserVerification` interface:**
- All fields typed correctly
- Status: `'pending' | 'verified' | 'rejected' | 'expired'`
- Relationships included

---

## 5️⃣ FACTORY UPDATES

### 📄 `database/factories/UserFactory.php`
**New default state with realistic data:**
- Vietnamese phone format: `+84#########`
- Proper age validation (18+ for date_of_birth)
- Random roles with proper distribution

**New factory methods:**
```php
->customer()    // Create customer user
->owner()       // Create owner user
->admin()       // Create admin user
->suspended()   // Suspended account
->banned()      // Banned account
->oauth('google') // OAuth user
->withTwoFactor() // Enable 2FA
```

### 📄 `database/factories/UserVerificationFactory.php` (NEW)
**Realistic Vietnamese data:**
- License numbers: `B######` format
- Default country: Vietnam
- Default nationality: Vietnamese

**Factory methods:**
```php
->verified()   // Verified by admin
->rejected()   // Rejected with reason
->expired()    // Expired license
->pending()    // Pending verification
```

---

## 6️⃣ SEEDER UPDATES

### 📄 `database/seeders/DatabaseSeeder.php`
**Pre-seeded test accounts:**
1. **Admin**: `admin@autorental.com` / `password`
2. **Customer**: `customer@example.com` / `password` (with verified license)
3. **Owner**: `owner@example.com` / `password`

**Additional seeding:**
- 10 random customers
- 3 random owners
- 3 pending verifications
- 5 verified verifications

---

## 🚀 USAGE EXAMPLES

### Run migrations & seeders:
```bash
php artisan migrate:fresh --seed
```

### Create test users:
```php
// Customer with verified license
$user = User::factory()->customer()->create();
UserVerification::factory()->verified()->create(['user_id' => $user->id]);

// Owner account
$owner = User::factory()->owner()->create();

// Suspended customer
$suspended = User::factory()->customer()->suspended()->create();

// Rejected verification
$user = User::factory()->customer()->create();
UserVerification::factory()->rejected('ID photo is blurry')->create(['user_id' => $user->id]);
```

---

## 📋 CHECKLIST

✅ Migrations updated (users + user_verifications)
✅ Models created/updated (User + UserVerification)
✅ TypeScript types synced
✅ Factories updated with realistic data
✅ Seeders enhanced with test data
✅ Indexes added for performance
✅ Constraints added for data integrity
✅ Audit trails implemented

---

## ⚠️ BREAKING CHANGES

1. **Role change**: `driver` → `owner` (update existing data if needed)
2. **Phone unique removed**: Now indexed only (existing data safe)
3. **New required relationship**: Users need verification for certain features

---

## 🔄 NEXT STEPS

1. Run `php artisan migrate:fresh --seed` to test
2. Update controllers to use new `status` field
3. Add verification middleware for booking features
4. Update admin panel to show audit trails
5. Add license expiry notifications

---

**Questions or issues?** Check migration files for full schema details.
