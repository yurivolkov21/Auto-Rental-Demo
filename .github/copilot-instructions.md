# AI Coding Instructions - AutoRental App

Laravel 12 + React 19 + Inertia.js car rental platform (Vietnam market).

## Language Preference
**CRITICAL:** All UI content, landing pages, and user-facing text MUST be in ENGLISH, not Vietnamese. This is targeting an international audience for the Vietnam car rental market.

## Architecture
**Inertia Flow:** `Controller → Inertia::render() → React PageProps<T>` (NO REST API)
**Schema Truth:** `database/migrations/` - đọc trước khi sửa Models/Controllers. Không edit migrations cũ.
**Routes:** `web.php` (public), `auth.php` (Fortify), `settings.php` (user), `admin.php` (`['auth','admin']`)
**Roles:** `customer`, `owner`, `admin` (no Gates/Policies)

## Workflows
```bash
composer dev                   # Laravel + Queue + Vite
composer test                  # Pest (SQLite in-memory)
npm run types && npm run lint  # Frontend validation
```

**Rules:** Backend changes cần tests. Frontend pass types+lint. Schema changes → update 6 places: Migration, Model `$fillable`+`$casts`, Factory, Seeder, Controller validation, TS types.

## AI Assistant Behavior Rules
**CRITICAL - Follow these rules strictly:**

1. **Documentation Files:**
   - ❌ **DO NOT** automatically create markdown documentation files (*.md)
   - ✅ Only create documentation when explicitly requested by user
   - ✅ Provide summary in chat response instead of creating files
   - Exception: README.md or docs specifically requested

2. **Test Files:**
   - ❌ **DO NOT** automatically create or update test files
   - ✅ Only create/modify tests when explicitly requested
   - ✅ Mention what tests should be added, but don't create them
   - Exception: User specifically asks "create tests" or "add test coverage"

3. **Code Changes:**
   - ✅ Always implement requested features/fixes directly in code
   - ✅ Update Models, Controllers, Migrations, Factories, Seeders as needed
   - ✅ Sync TypeScript types with PHP models
   - ✅ Provide clear summary of changes in chat

**Example workflows:**
- User: "Add status field to users" → Update migration, model, types (NO .md file, NO tests unless asked)
- User: "Document this feature" → Create .md file (explicitly requested)
- User: "Add tests for password validation" → Create test files (explicitly requested)

## Database Seeding Workflow
**CRITICAL FLOW:** `Migrations (source of truth) → Factories → Seeders → php artisan db:seed`

1. **Migrations** = Schema source of truth - NEVER modify old migrations
2. **Factories** = Read migration fields, create fake data generators (`database/factories/*Factory.php`)
3. **Seeders** = Use factories to create test data (`database/seeders/DatabaseSeeder.php`)
4. **Execution**: `php artisan migrate:fresh --seed` (fresh DB with all data)

**Factory Rules:**
- Check migration for all `$table->` columns (required, nullable, enum values, defaults)
- Match exact data types and constraints from migration
- Use `fake()` for realistic Vietnamese data
- Reference existing records with `Model::inRandomOrder()->first()` or fallback to `Model::factory()`

**Seeder Rules:**
- Create static/master data first (categories, brands, locations)
- Then create users with roles
- Then dependent data (cars, drivers, promotions)
- Finally transactional data (bookings, payments)
- Use `firstOrCreate()` for unique constraints

## Conventions
- Models extend `Eloquent\Model`, Factories extend `BaseFactory`, Seeders extend `BaseSeeder`
- TS interfaces: `resources/js/types/models/*.ts` sync với PHP `$fillable`
- Admin pages: Apply hover effects + breadcrumbs (all pages). Colors: Blue/Green/Red/Purple/Orange
- Decimals: `decimal(10,2)` money, `decimal(12,2)` large costs, `decimal(3,2)` rates

## Known Issues
1. `promotions`: Use `where('status','active')` NOT `is_active`
2. `car_categories` Model: Missing `icon`, `is_active`, `sort_order` in `$fillable`
3. `resources/js/types/admin.ts`: Missing `Notification*` exports

**Examples:** `app/Models/Car.php`, `app/Http/Controllers/Admin/UserController.php`, `tests/Feature/Admin/AdminBookingsTest.php`, `resources/js/pages/admin/cars/index.tsx`
