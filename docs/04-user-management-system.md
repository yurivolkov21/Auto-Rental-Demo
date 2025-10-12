# User Management System

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Status:** 📋 Documentation Guide

## Overview

User Management is a comprehensive system for managing users across three roles (Customer, Owner, Admin) in the AutoRental car rental platform. This feature enables administrators to create, view, update, delete users, manage their roles and status, handle OAuth integrations, two-factor authentication, and soft-delete accounts with retention policies.

## Architecture

### Database Schema

**Table:** `users`
- **Primary Key:** `id` (bigint unsigned)
- **Unique Fields:** `email`, composite unique `[provider, provider_id]`
- **Core Fields:**
  - `name` (string 255, required) - User's full name
  - `email` (string 255, unique, required) - Email address
  - `password` (string 255, required) - Hashed password (bcrypt/argon2)
  - `email_verified_at` (timestamp, nullable) - Email verification timestamp

- **OAuth Integration:**
  - `provider` (string 50, nullable) - OAuth provider (google, facebook, github)
  - `provider_id` (string, nullable) - OAuth provider user ID
  - Composite unique index: `[provider, provider_id]`

- **Two-Factor Authentication:**
  - `two_factor_secret` (text, nullable) - Encrypted 2FA secret key
  - `two_factor_recovery_codes` (text, nullable) - Encrypted backup codes
  - `two_factor_confirmed_at` (timestamp, nullable) - 2FA activation timestamp

- **Profile Information:**
  - `avatar` (text, nullable) - Avatar image URL/path
  - `bio` (text, nullable) - Short biography (max 500 chars recommended)
  - `phone` (string 20, nullable, indexed) - International format (+84...)
  - `address` (text, nullable) - Full physical address
  - `date_of_birth` (date, nullable) - Date of birth for age verification

- **Role & Status:**
  - `role` (enum: customer, owner, admin, default: customer, indexed)
    - **customer**: Regular users who rent cars
    - **owner**: Users who list cars for rent
    - **admin**: Platform administrators
  - `status` (enum: active, inactive, suspended, banned, default: active, indexed)
    - **active**: Normal account in good standing
    - **inactive**: User-initiated deactivation
    - **suspended**: Temporary admin restriction
    - **banned**: Permanent restriction

- **Account Deletion (Soft Delete):**
  - `deletion_reason` (text, nullable) - User-provided reason
  - `deletion_requested_at` (timestamp, nullable) - Deletion request timestamp
  - `deleted_at` (timestamp, nullable, indexed) - Soft delete timestamp

- **Session Management:**
  - `remember_token` (string 100, nullable) - "Remember me" token
  - `created_at`, `updated_at` (timestamps)

- **Indexes (9 total):**
  - Primary: `id`
  - Unique: `email`, `[provider, provider_id]`
  - Regular: `role`, `status`, `phone`, `deleted_at`
  - Composite: `[provider, provider_id]`

### Backend Structure

#### Model: `User`
**Location:** `app/Models/User.php`

**Key Features:**
- Extends `Authenticatable`
- Traits: `HasFactory`, `Notifiable`, `SoftDeletes`
- Hidden fields: `password`, `remember_token`, `two_factor_*`
- Fillable: All profile fields, role, status (exclude sensitive fields)
- Casts: `email_verified_at`, `two_factor_confirmed_at`, `deleted_at` → datetime

**Relationships:**
```php
// One-to-One
hasOne(UserVerification::class) - verification details

// One-to-Many (future)
hasMany(Booking::class) - rental bookings
hasMany(Car::class, 'owner_id') - owned cars (for owners)
hasMany(Review::class) - written reviews
```

**Scopes:**
```php
scopeCustomers($query)    // Filter by role = customer
scopeOwners($query)       // Filter by role = owner
scopeAdmins($query)       // Filter by role = admin
scopeActive($query)       // Filter by status = active
scopeVerified($query)     // Filter email_verified_at IS NOT NULL
scopeWithVerification($query) // Eager load verification relationship
scopeSearch($query, $term) // Search by name, email, phone
```

**Helper Methods:**
```php
isAdmin(): bool           // Check if role = admin
isOwner(): bool          // Check if role = owner
isCustomer(): bool       // Check if role = customer
isActive(): bool         // Check if status = active
hasVerifiedEmail(): bool // Check email verification
hasVerification(): bool  // Check if verification exists
isVerified(): bool       // Check if verification status = verified
canRentCars(): bool      // Check if user can rent (customer + verified)
canListCars(): bool      // Check if user can list cars (owner + verified)
```

#### Controller: `Admin/UserController`
**Location:** `app/Http/Controllers/Admin/UserController.php`

**Methods (10 total):**

1. **`index(Request $request): Response`**
   - **Purpose:** List all users with filters and statistics
   - **Features:**
     - Pagination: 20 users/page
     - Filters: role, status, verification status, search
     - Sorting: latest users first
     - Stats calculation: total, customers, owners, admins, verified, active
     - Search: name, email, phone (fulltext or LIKE)
     - Eager load: verification relationship
   - **Query String Parameters:**
     - `?role=customer|owner|admin|all` (default: all)
     - `?status=active|inactive|suspended|banned|all` (default: all)
     - `?verified=yes|no|all` (default: all)
     - `?search=keyword` (searches name, email, phone)
   - **Returns:** Inertia page `admin/users/index`

2. **`create(): Response`**
   - **Purpose:** Show user creation form
   - **Returns:** Inertia page `admin/users/create`

3. **`store(UserStoreRequest $request): RedirectResponse`**
   - **Purpose:** Create new user account
   - **Validation Rules:**
     - `name`: required, string, max:255
     - `email`: required, email, unique:users
     - `password`: required, min:8, confirmed
     - `role`: required, in:customer,owner,admin
     - `status`: required, in:active,inactive
     - `phone`: nullable, string, max:20
     - `address`: nullable, string
     - `date_of_birth`: nullable, date, before:today
   - **Logic:**
     - Hash password with bcrypt
     - Set `email_verified_at` to now() for admin-created accounts
     - Auto-generate avatar URL (Gravatar or default)
   - **Flash:** Success or error message
   - **Redirect:** Back to index or stay on create

4. **`show(User $user): Response`**
   - **Purpose:** Display detailed user information
   - **Features:**
     - Load verification relationship
     - Show all profile data
     - Display booking history (future)
     - Show owned cars (for owners)
   - **Returns:** Inertia page `admin/users/show`

5. **`edit(User $user): Response`**
   - **Purpose:** Show user edit form
   - **Features:**
     - Pre-fill all existing data
     - Cannot edit email if OAuth user
   - **Returns:** Inertia page `admin/users/edit`

6. **`update(UserUpdateRequest $request, User $user): RedirectResponse`**
   - **Purpose:** Update user information
   - **Validation Rules:**
     - `name`: required, string, max:255
     - `email`: required, email, unique:users,email,{id}
     - `role`: required, in:customer,owner,admin
     - `status`: required, in:active,inactive,suspended,banned
     - `phone`: nullable, string, max:20
     - `address`: nullable, string
     - `date_of_birth`: nullable, date, before:today
     - `bio`: nullable, string, max:500
   - **Logic:**
     - Don't update password here (use separate endpoint)
     - Log role/status changes
     - Send notification if status changed to suspended/banned
   - **Flash:** Success or error message
   - **Redirect:** Back to user show page

7. **`destroy(User $user): RedirectResponse`**
   - **Purpose:** Soft delete user account
   - **Validation:**
     - Cannot delete self
     - Cannot delete last admin
     - Cannot delete users with active bookings (future)
   - **Logic:**
     - Soft delete (sets `deleted_at`)
     - Keep data for audit purposes
     - Can be restored within 30 days
   - **Flash:** Success or error message
   - **Redirect:** Back to index

8. **`changeStatus(Request $request, User $user): RedirectResponse`**
   - **Purpose:** Change user status (activate, suspend, ban)
   - **Validation:**
     - `status`: required, in:active,inactive,suspended,banned
     - `reason`: required_if:status,suspended,banned
   - **Logic:**
     - Update status
     - Log change with reason
     - Send email notification to user
     - Logout user if suspended/banned
   - **Flash:** Success message
   - **Redirect:** Back to previous page

9. **`changeRole(Request $request, User $user): RedirectResponse`**
   - **Purpose:** Change user role (promote/demote)
   - **Validation:**
     - `role`: required, in:customer,owner,admin
     - Cannot change own role
     - Cannot remove last admin
   - **Logic:**
     - Update role
     - Log change
     - Send notification email
   - **Flash:** Success message
   - **Redirect:** Back to previous page

10. **`resetPassword(Request $request, User $user): RedirectResponse`**
    - **Purpose:** Admin-initiated password reset
    - **Validation:**
      - `password`: required, min:8, confirmed
    - **Logic:**
      - Hash new password
      - Invalidate all sessions
      - Send password change notification
    - **Flash:** Success message
    - **Redirect:** Back to user page

#### Form Request Validation Classes

**1. UserStoreRequest**
**Location:** `app/Http/Requests/Admin/UserStoreRequest.php`

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
        'role' => ['required', 'in:customer,owner,admin'],
        'status' => ['required', 'in:active,inactive'],
        'phone' => ['nullable', 'string', 'max:20'],
        'address' => ['nullable', 'string'],
        'date_of_birth' => ['nullable', 'date', 'before:today'],
        'bio' => ['nullable', 'string', 'max:500'],
    ];
}

public function messages(): array
{
    return [
        'email.unique' => 'This email address is already registered.',
        'password.min' => 'Password must be at least 8 characters.',
        'date_of_birth.before' => 'Date of birth must be in the past.',
    ];
}
```

**2. UserUpdateRequest**
**Location:** `app/Http/Requests/Admin/UserUpdateRequest.php`

```php
/**
 * @method User route(string $param)
 */
public function rules(): array
{
    $user = $this->route('user');

    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'role' => ['required', 'in:customer,owner,admin'],
        'status' => ['required', 'in:active,inactive,suspended,banned'],
        'phone' => ['nullable', 'string', 'max:20'],
        'address' => ['nullable', 'string'],
        'date_of_birth' => ['nullable', 'date', 'before:today'],
        'bio' => ['nullable', 'string', 'max:500'],
    ];
}
```

#### Middleware & Authorization

**Admin Middleware**
**Location:** `app/Http/Middleware/AdminMiddleware.php`

```php
public function handle(Request $request, Closure $next): Response
{
    if (!$request->user() || $request->user()->role !== 'admin') {
        abort(403, 'Unauthorized access.');
    }

    return $next($request);
}
```

**Role-based Access Control:**
- All User Management routes require `auth`, `verified`, `admin` middleware
- No Policies or Gates needed (simple role check)
- Admin users can manage all users
- Regular users cannot access admin panel

### Routes Configuration

**File:** `routes/admin.php`

```php
Route::prefix('users')->name('users.')->group(function () {
    // Standard CRUD
    Route::get('/', [UserController::class, 'index'])->name('index');
    Route::get('/create', [UserController::class, 'create'])->name('create');
    Route::post('/', [UserController::class, 'store'])->name('store');
    Route::get('/{user}', [UserController::class, 'show'])->name('show');
    Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
    Route::put('/{user}', [UserController::class, 'update'])->name('update');
    Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');

    // Special Actions
    Route::post('/{user}/change-status', [UserController::class, 'changeStatus'])->name('change-status');
    Route::post('/{user}/change-role', [UserController::class, 'changeRole'])->name('change-role');
    Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
});
```

**Route Names (10 routes):**
- `admin.users.index` → GET `/admin/users`
- `admin.users.create` → GET `/admin/users/create`
- `admin.users.store` → POST `/admin/users`
- `admin.users.show` → GET `/admin/users/{user}`
- `admin.users.edit` → GET `/admin/users/{user}/edit`
- `admin.users.update` → PUT `/admin/users/{user}`
- `admin.users.destroy` → DELETE `/admin/users/{user}`
- `admin.users.change-status` → POST `/admin/users/{user}/change-status`
- `admin.users.change-role` → POST `/admin/users/{user}/change-role`
- `admin.users.reset-password` → POST `/admin/users/{user}/reset-password`

---

## Frontend Implementation

### TypeScript Types

**File:** `resources/js/types/index.d.ts`

```typescript
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;

    // OAuth fields
    provider?: string | null;
    provider_id?: string | null;

    // Two-factor authentication
    two_factor_enabled?: boolean;
    two_factor_confirmed_at?: string | null;

    // Profile information
    avatar?: string | null;
    bio?: string | null;
    phone?: string | null;
    address?: string | null;
    date_of_birth?: string | null;

    // Role & status
    role: 'customer' | 'owner' | 'admin';
    status: 'active' | 'inactive' | 'suspended' | 'banned';

    // Account deletion
    deletion_reason?: string | null;
    deletion_requested_at?: string | null;
    deleted_at?: string | null;

    // Relationships
    verification?: UserVerification;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    total: number;
    customers: number;
    owners: number;
    admins: number;
    verified: number;
    active: number;
}

export interface UserFilters {
    role: 'all' | 'customer' | 'owner' | 'admin';
    status: 'all' | 'active' | 'inactive' | 'suspended' | 'banned';
    verified: 'all' | 'yes' | 'no';
    search: string;
}
```

### Admin Panel Design System

Following the established design patterns from Location and Promotion Management:

#### Page Layout Pattern

**1. Index Page** (`admin/users/index.tsx`)

```tsx
Structure:
├─ Page Header (Title + "Add User" button)
├─ Stats Cards (6 cards in md:grid-cols-3 lg:grid-cols-6)
│  ├─ Total Users
│  ├─ Customers
│  ├─ Owners
│  ├─ Admins
│  ├─ Verified Users
│  └─ Active Users
├─ Card Container
│  ├─ Filters Row
│  │  ├─ Search Input (name, email, phone)
│  │  ├─ Role Filter (All, Customer, Owner, Admin)
│  │  ├─ Status Filter (All, Active, Inactive, Suspended, Banned)
│  │  └─ Verified Filter (All, Yes, No)
│  ├─ Users Table
│  │  └─ Columns: Avatar, Name, Email, Role, Status, Verified, Join Date, Actions
│  └─ Pagination
```

**Stats Cards Design:**
```tsx
<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
    {/* Total Users */}
    <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
            <CardTitle className="text-sm font-medium leading-tight">
                Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
        </CardHeader>
        <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
                All registered users
            </p>
        </CardContent>
    </Card>

    {/* Similar cards for Customers, Owners, Admins, Verified, Active */}
</div>
```

**Table Design:**
```tsx
<TableRow className="hover:bg-muted/50">
    <TableCell>
        {/* Avatar */}
        <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
        </div>
    </TableCell>
    <TableCell>
        <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
    </TableCell>
    <TableCell>
        {/* Role Badge */}
        <Badge className={getRoleBadgeClass(user.role)}>
            {getRoleIcon(user.role)}
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </Badge>
    </TableCell>
    <TableCell>
        {/* Status Badge */}
        <Badge className={getStatusBadgeClass(user.status)}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
    </TableCell>
    <TableCell>
        {/* Verification Badge */}
        {user.verification?.status === 'verified' ? (
            <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
            </Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800">
                <X className="mr-1 h-3 w-3" />
                Unverified
            </Badge>
        )}
    </TableCell>
    <TableCell>
        {formatDate(user.created_at)}
    </TableCell>
    <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/users/${user.id}`}>
                    <Eye className="h-4 w-4" />
                </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4" />
                </Link>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(user)}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
        </div>
    </TableCell>
</TableRow>
```

**2. Create/Edit Page** (`admin/users/create.tsx`, `admin/users/edit.tsx`)

```tsx
Structure (lg:grid-cols-3):
├─ Main Form (lg:col-span-2)
│  ├─ Basic Information Card
│  │  ├─ Name (required)
│  │  ├─ Email (required)
│  │  └─ Password (required on create, optional on edit)
│  ├─ Profile Information Card
│  │  ├─ Phone
│  │  ├─ Date of Birth
│  │  ├─ Address
│  │  └─ Bio (textarea)
│  └─ Avatar Upload Card
│     └─ Image uploader with preview
└─ Sidebar (lg:col-span-1)
   ├─ Role & Status Card
   │  ├─ Role Select (Customer, Owner, Admin)
   │  └─ Status Select (Active, Inactive)
   └─ Action Buttons Card
      ├─ Save Button
      └─ Cancel Button
```

**Form Validation Display:**
```tsx
<div className="space-y-2">
    <Label htmlFor="email">
        Email Address <span className="text-red-500">*</span>
    </Label>
    <Input
        id="email"
        type="email"
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        className={errors.email ? 'border-red-500' : ''}
        placeholder="user@example.com"
    />
    {errors.email && (
        <p className="text-sm text-red-500">{errors.email}</p>
    )}
</div>
```

**3. Show Page** (`admin/users/show.tsx`)

```tsx
Structure (lg:grid-cols-3):
├─ Header (Back + Title + Action Buttons)
│  ├─ Change Status Button (Dialog)
│  ├─ Change Role Button (Dialog)
│  ├─ Reset Password Button (Dialog)
│  ├─ Edit Button
│  └─ Delete Button
├─ Main Content (lg:col-span-2)
│  ├─ Profile Card
│  │  ├─ Avatar (large, centered)
│  │  ├─ Name + Badges (role, status, verified)
│  │  └─ Bio
│  ├─ Contact Information Card
│  │  ├─ Email (with verified icon)
│  │  ├─ Phone
│  │  └─ Address
│  ├─ Account Details Card
│  │  ├─ User ID
│  │  ├─ Join Date
│  │  ├─ Last Updated
│  │  ├─ Email Verified At
│  │  └─ OAuth Provider (if applicable)
│  └─ Activity History Card (future)
│     └─ Recent bookings, reviews, etc.
└─ Sidebar (lg:col-span-1)
   ├─ Quick Stats Card
   │  ├─ Total Bookings
   │  ├─ Cars Owned (if owner)
   │  └─ Reviews Written
   ├─ Verification Status Card
   │  ├─ Verification Badge
   │  └─ View Verification Button (if exists)
   └─ Meta Information Card
      ├─ Created At
      ├─ Updated At
      └─ Deletion Info (if deleted)
```

**Action Dialogs:**

```tsx
{/* Change Status Dialog */}
<Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Change User Status</DialogTitle>
            <DialogDescription>
                Update the status for <strong>{user.name}</strong>
            </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {(newStatus === 'suspended' || newStatus === 'banned') && (
                <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                        id="reason"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="Explain why this action is being taken..."
                    />
                </div>
            )}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
            </Button>
            <Button onClick={handleChangeStatus}>
                Change Status
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

{/* Similar dialogs for Change Role and Reset Password */}
```

### Design System Components

#### Badge Color Schemes

**Role Badges:**
```typescript
const roleBadges = {
    customer: 'bg-blue-100 text-blue-800',
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
};

const roleIcons = {
    customer: <Users className="mr-1 h-3 w-3" />,
    owner: <Car className="mr-1 h-3 w-3" />,
    admin: <Shield className="mr-1 h-3 w-3" />,
};
```

**Status Badges:**
```typescript
const statusBadges = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
};
```

**Verification Badges:**
```typescript
const verificationBadges = {
    verified: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    none: 'bg-gray-100 text-gray-800',
};
```

#### Icons (lucide-react)

Standard icons for User Management:
```tsx
import {
    Users,          // Users main icon
    User,           // Single user
    Shield,         // Admin role
    Car,            // Owner role
    CheckCircle,    // Verified
    XCircle,        // Rejected/Banned
    Clock,          // Pending
    Mail,           // Email
    Phone,          // Phone number
    MapPin,         // Address
    Calendar,       // Date of birth
    Edit,           // Edit action
    Eye,            // View action
    Trash2,         // Delete action
    Key,            // Reset password
    UserCog,        // Change role
    UserCheck,      // Change status
} from 'lucide-react';
```

### Helper Functions

**Format Functions:**
```typescript
// Format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date with time
const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get initials from name
const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Get role badge class
const getRoleBadgeClass = (role: string) => {
    const classes = {
        customer: 'bg-blue-100 text-blue-800',
        owner: 'bg-purple-100 text-purple-800',
        admin: 'bg-red-100 text-red-800',
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
};

// Get status badge class
const getStatusBadgeClass = (status: string) => {
    const classes = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        suspended: 'bg-yellow-100 text-yellow-800',
        banned: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
};
```

---

## Database Seeding

### User Factory

**File:** `database/factories/UserFactory.php`

```php
public function definition(): array
{
    return [
        'name' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'email_verified_at' => fake()->boolean(80) ? now() : null, // 80% verified
        'password' => Hash::make('password'), // Default password
        'avatar' => fake()->optional()->imageUrl(200, 200, 'people'),
        'bio' => fake()->optional()->sentence(),
        'phone' => fake()->optional()->phoneNumber(),
        'address' => fake()->optional()->address(),
        'date_of_birth' => fake()->optional()->date('Y-m-d', '-18 years'),
        'role' => 'customer',
        'status' => 'active',
        'remember_token' => Str::random(10),
    ];
}

/**
 * State: Customer role
 */
public function customer(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => 'customer',
    ]);
}

/**
 * State: Owner role
 */
public function owner(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => 'owner',
    ]);
}

/**
 * State: Admin role
 */
public function admin(): static
{
    return $this->state(fn (array $attributes) => [
        'role' => 'admin',
    ]);
}

/**
 * State: Unverified email
 */
public function unverified(): static
{
    return $this->state(fn (array $attributes) => [
        'email_verified_at' => null,
    ]);
}

/**
 * State: Suspended status
 */
public function suspended(): static
{
    return $this->state(fn (array $attributes) => [
        'status' => 'suspended',
    ]);
}

/**
 * State: OAuth user
 */
public function oauth(string $provider = 'google'): static
{
    return $this->state(fn (array $attributes) => [
        'provider' => $provider,
        'provider_id' => fake()->uuid(),
        'password' => null, // OAuth users may not have password
    ]);
}
```

### Database Seeder

**File:** `database/seeders/DatabaseSeeder.php`

```php
private function seedUsers(): void
{
    // 1. Create Admin Users (3 admins)
    User::factory()
        ->count(3)
        ->admin()
        ->create();

    // 2. Create Customer Users (50 customers)
    User::factory()
        ->count(50)
        ->customer()
        ->create();

    // 3. Create Owner Users (20 owners)
    User::factory()
        ->count(20)
        ->owner()
        ->create();

    // 4. Create some unverified users (10 users)
    User::factory()
        ->count(10)
        ->customer()
        ->unverified()
        ->create();

    // 5. Create some suspended users (5 users)
    User::factory()
        ->count(5)
        ->customer()
        ->suspended()
        ->create();

    // 6. Create OAuth users (5 users)
    User::factory()
        ->count(3)
        ->customer()
        ->oauth('google')
        ->create();

    User::factory()
        ->count(2)
        ->customer()
        ->oauth('facebook')
        ->create();

    // 7. Create test accounts with known credentials
    User::firstOrCreate(
        ['email' => 'admin@autorental.vn'],
        [
            'name' => 'System Administrator',
            'password' => Hash::make('admin123'),
            'email_verified_at' => now(),
            'role' => 'admin',
            'status' => 'active',
            'phone' => '+84937699061',
        ]
    );

    User::firstOrCreate(
        ['email' => 'customer@example.com'],
        [
            'name' => 'Test Customer',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'customer',
            'status' => 'active',
            'phone' => '+84912345678',
        ]
    );

    User::firstOrCreate(
        ['email' => 'owner@example.com'],
        [
            'name' => 'Test Owner',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'role' => 'owner',
            'status' => 'active',
            'phone' => '+84923456789',
        ]
    );

    $this->command->info('✓ Seeded ' . User::count() . ' users');
}
```

---

## Business Logic & Rules

### User Role Permissions

**Customer:**
- ✅ Can browse and rent cars
- ✅ Must be verified to make bookings
- ✅ Can write reviews after completed rentals
- ❌ Cannot list cars
- ❌ Cannot access admin panel

**Owner:**
- ✅ Can list and manage their own cars
- ✅ Must be verified to list cars
- ✅ Can set pricing and availability
- ✅ Receives booking notifications
- ❌ Cannot access admin panel
- ❌ Cannot manage other users' cars

**Admin:**
- ✅ Full access to admin panel
- ✅ Can manage all users, cars, bookings
- ✅ Can verify user documents
- ✅ Can suspend/ban users
- ✅ Cannot be deleted by other admins
- ⚠️ Last admin cannot change own role

### Status Management Rules

**Active:**
- Normal account in good standing
- Full access to platform features
- Can perform role-specific actions

**Inactive:**
- User-initiated deactivation
- Temporary suspension of account
- Can be reactivated by user
- Data retained

**Suspended:**
- Admin-initiated temporary restriction
- Reason required
- Cannot login
- Email notification sent
- Can be reinstated

**Banned:**
- Admin-initiated permanent restriction
- Reason required (must be documented)
- Cannot login
- Email notification sent
- Cannot be easily reinstated (requires admin approval)
- Historical data retained for legal purposes

### Email Verification

**Unverified Users:**
- Can login and view platform
- Cannot make bookings (customers)
- Cannot list cars (owners)
- Prompted to verify email on dashboard

**Verification Process:**
1. User registers → email sent with verification link
2. User clicks link → `email_verified_at` set to now()
3. User gains full access based on role

**Admin-created accounts:**
- Automatically verified (`email_verified_at` set)
- Welcome email sent with temporary password
- User prompted to change password on first login

### Soft Delete Policy

**Deletion Process:**
1. User requests account deletion
2. `deletion_requested_at` set to now()
3. Grace period: 7 days before actual deletion
4. After 7 days: `deleted_at` set (soft delete)
5. Data retained for 30 days
6. After 30 days: Hard delete via scheduled job

**Retention Reasons:**
- Legal compliance (booking history, payments)
- Audit trail for fraud prevention
- Restoration in case of accidental deletion

**Cannot Delete If:**
- User has active bookings
- User has pending payments
- User is the last admin
- Trying to delete own account (admin)

---

## Security Considerations

### Password Management

1. **Hashing:**
   - Use `bcrypt` or `argon2` (Laravel default)
   - Never store plain text passwords
   - Minimum 8 characters, recommend 12+

2. **Password Reset:**
   - Admin can reset user passwords
   - Old sessions invalidated
   - User notified via email
   - Cannot reset last admin password

3. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter (recommended)
   - At least one number (recommended)
   - At least one special character (recommended)

### Two-Factor Authentication (2FA)

**Implementation:**
- Optional for customers/owners
- Mandatory for admins (future)
- Uses TOTP (Time-based One-Time Password)
- Recovery codes provided (encrypted)

**Flow:**
1. User enables 2FA in settings
2. QR code displayed (Google Authenticator compatible)
3. User verifies with first code
4. `two_factor_confirmed_at` set
5. 8 recovery codes generated (encrypted)
6. Required on every login

### OAuth Security

**Supported Providers:**
- Google OAuth 2.0
- Facebook Login
- GitHub (future)

**Security Measures:**
- Verify OAuth state parameter
- Store provider ID, not email
- Email conflict handled (link accounts)
- Cannot change email if OAuth user

### Rate Limiting

**Login Attempts:**
- Max 5 attempts per 15 minutes
- Lockout duration: 15 minutes
- Notification sent on suspicious activity

**Password Reset:**
- Max 3 requests per hour per email
- Tokens expire after 1 hour

**API Endpoints:**
- 60 requests per minute per IP
- 1000 requests per hour per user

---

## Performance Optimization

### Database Indexes

**Critical Indexes:**
```php
$table->index('role');                    // Fast role filtering
$table->index('status');                  // Fast status filtering
$table->index(['provider', 'provider_id']); // OAuth lookups
$table->index('deleted_at');              // Soft delete queries
$table->index('phone');                   // Phone number searches
$table->unique(['provider', 'provider_id']); // Prevent duplicate OAuth accounts
```

### Query Optimization

**Index Page:**
```php
// Efficient query with pagination
User::query()
    ->when($role !== 'all', fn($q) => $q->where('role', $role))
    ->when($status !== 'all', fn($q) => $q->where('status', $status))
    ->when($search, fn($q) => $q->search($search))
    ->with('verification:id,user_id,status') // Eager load
    ->orderBy('created_at', 'desc')
    ->paginate(20);
```

**Statistics:**
```php
// Cache stats for 5 minutes
$stats = Cache::remember('user_stats', 300, function () {
    return [
        'total' => User::count(),
        'customers' => User::where('role', 'customer')->count(),
        'owners' => User::where('role', 'owner')->count(),
        'admins' => User::where('role', 'admin')->count(),
        'verified' => User::whereNotNull('email_verified_at')->count(),
        'active' => User::where('status', 'active')->count(),
    ];
});
```

### Caching Strategy

**Cache Keys:**
- `user_stats` - User statistics (5 min TTL)
- `user_roles_count` - Role distribution (10 min TTL)
- `active_users_count` - Active user count (5 min TTL)

**Cache Invalidation:**
- Clear on user create/update/delete
- Clear on role/status change
- Use tags for grouped invalidation

---

## Testing Strategy

### Unit Tests

**Model Tests:**
```php
test('user can be created with valid data')
test('user email must be unique')
test('user password is hashed')
test('isAdmin() returns true for admin role')
test('isCustomer() returns true for customer role')
test('isOwner() returns true for owner role')
test('isActive() returns true for active status')
test('hasVerifiedEmail() checks email_verified_at')
test('canRentCars() checks customer + verified')
test('canListCars() checks owner + verified')
```

### Feature Tests

**Controller Tests:**
```php
test('admin can view users index page')
test('admin can view user details')
test('admin can create new user')
test('admin can update user information')
test('admin can delete user')
test('admin can change user status')
test('admin can change user role')
test('admin can reset user password')
test('admin cannot delete self')
test('admin cannot delete last admin')
test('customer cannot access admin panel')
test('user creation validates required fields')
test('user update validates email uniqueness')
```

### Frontend Tests

**Component Tests:**
```typescript
test('renders user list correctly')
test('filters users by role')
test('filters users by status')
test('searches users by name/email')
test('displays user badges correctly')
test('opens delete confirmation dialog')
test('opens change status dialog')
test('shows validation errors on form')
```

---

## API Endpoints (Future - REST API)

For mobile app or third-party integrations:

### Authentication Endpoints
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
POST   /api/auth/verify-email      - Verify email
```

### User Profile Endpoints
```
GET    /api/user                   - Get authenticated user
PUT    /api/user                   - Update profile
DELETE /api/user                   - Delete account
POST   /api/user/avatar            - Upload avatar
POST   /api/user/enable-2fa        - Enable 2FA
POST   /api/user/disable-2fa       - Disable 2FA
```

### Admin Endpoints (requires admin role)
```
GET    /api/admin/users            - List users
POST   /api/admin/users            - Create user
GET    /api/admin/users/{id}       - Get user details
PUT    /api/admin/users/{id}       - Update user
DELETE /api/admin/users/{id}       - Delete user
POST   /api/admin/users/{id}/status - Change status
POST   /api/admin/users/{id}/role  - Change role
```

---

## Deployment Checklist

### Pre-Deployment
- ✅ Run migrations: `php artisan migrate`
- ✅ Seed users: `php artisan db:seed --class=UserSeeder`
- ✅ Clear cache: `php artisan optimize:clear`
- ✅ Compile frontend: `npm run build`
- ✅ Run tests: `php artisan test`
- ✅ Check lint: `npm run lint`
- ✅ Verify types: `npm run types`

### Post-Deployment
- ✅ Create admin account manually
- ✅ Test login/logout flow
- ✅ Test password reset
- ✅ Test email verification
- ✅ Test OAuth integration
- ✅ Test role/status changes
- ✅ Monitor error logs
- ✅ Check email deliverability

### Environment Variables
```env
# Admin Email (for super admin)
ADMIN_EMAIL=admin@autorental.vn

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@autorental.vn
MAIL_FROM_NAME="AutoRental"
```

---

## Troubleshooting

### Common Issues

**1. Cannot delete admin user**
- **Cause:** Trying to delete last admin or self
- **Solution:** Promote another user to admin first

**2. Email verification link expired**
- **Cause:** Link expires after 24 hours
- **Solution:** Resend verification email

**3. OAuth login fails**
- **Cause:** Invalid credentials or callback URL
- **Solution:** Check OAuth app settings in provider dashboard

**4. User cannot make bookings**
- **Cause:** Email not verified or verification status not "verified"
- **Solution:** Verify email and complete identity verification

**5. Soft deleted users appear in list**
- **Cause:** Forgot to filter by `deleted_at`
- **Solution:** Add `whereNull('deleted_at')` or use `withoutTrashed()`

---

## Future Enhancements

### Phase 1 (Q1 2026)
- ✅ Basic user CRUD
- ✅ Role and status management
- ✅ Email verification
- ✅ Password reset
- ⏳ OAuth integration (in progress)
- ⏳ 2FA for admins

### Phase 2 (Q2 2026)
- 📋 User activity logs
- 📋 Advanced search (Elasticsearch)
- 📋 Bulk operations (export, import)
- 📋 User impersonation (admin feature)
- 📋 Session management (view active sessions)

### Phase 3 (Q3 2026)
- 📋 Role-based permissions (granular)
- 📋 Custom roles
- 📋 User groups/teams
- 📋 API access tokens
- 📋 Webhooks for user events

### Phase 4 (Q4 2026)
- 📋 Machine learning for fraud detection
- 📋 Risk scoring system
- 📋 Advanced analytics dashboard
- 📋 User behavior tracking
- 📋 A/B testing infrastructure

---

## Conclusion

The User Management System is a foundational module for the AutoRental platform, providing secure authentication, role-based access control, and comprehensive user administration capabilities. This documentation serves as a complete guide for implementation, following the established patterns from existing modules.

**Key Features:**
- ✅ Three-role system (Customer, Owner, Admin)
- ✅ Four status levels (Active, Inactive, Suspended, Banned)
- ✅ Email verification flow
- ✅ OAuth integration ready
- ✅ Two-factor authentication support
- ✅ Soft delete with retention policy
- ✅ Consistent design system
- ✅ Comprehensive validation
- ✅ Performance optimized
- ✅ Security hardened

**Implementation Priority:**
1. Backend Model, Factory, Seeder → **High Priority**
2. Controller with CRUD operations → **High Priority**
3. Routes and middleware → **High Priority**
4. Frontend Index page → **High Priority**
5. Frontend Show page → **Medium Priority**
6. Frontend Form pages → **Medium Priority**
7. Action dialogs (status, role, password) → **Medium Priority**
8. Testing → **Medium Priority**

**Document Word Count:** ~5,500 words (comprehensive guide)

---

**Note:** This document should be used as a reference when implementing the User Management module. Follow the same patterns established in Location Management and Promotion Management for consistency across the application.
