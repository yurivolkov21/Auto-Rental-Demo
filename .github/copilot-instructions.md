# AI Coding Instructions - AutoRental App

Laravel 12 + React 19 + Inertia.js car rental platform (Vietnam market). **Limit markdown docs to 1500 words max.**

## Language Preference
**CRITICAL:** All UI content MUST be in ENGLISH (targeting international audience for Vietnam car rental market).

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
   - ❌ **DO NOT** auto-create markdown docs (*.md)
   - ✅ Only when explicitly requested + **limit to 2000-2500 words**
   - ✅ Provide summary in chat instead of files
   - Exception: README.md or docs specifically requested

2. **Test Files:**
   - ❌ **DO NOT** auto-create or update test files
   - ✅ Only when user asks "create tests" or "add test coverage"
   - ✅ Mention what tests needed, don't create unless asked

3. **Code Cleanup:**
   - ✅ **Always remove unused imports, functions, state variables**
   - ✅ Run lint/type checks after changes
   - ✅ Clean up commented code, debug logs, test buttons

4. **Code Changes:**
   - ✅ Implement features directly in code
   - ✅ Update Models, Controllers, Migrations, Factories, Seeders, TS types
   - ✅ Provide clear summary in chat

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
- Decimals: `decimal(10,2)` money, `decimal(12,2)` large costs, `decimal(3,2)` rates

## Admin Panel Design System
**CRITICAL - All admin pages MUST follow this unified design:**

### Layout Structure
- **Layout**: `AdminLayout` with breadcrumbs (from `@/layouts/admin-layout`)
- **Sidebar**: Auto-managed by layout (collapsible, active states)
- **Breadcrumbs**: Always provide `BreadcrumbItem[]` array

### Global Components (shadcn/ui)
Use these shared components for consistency:

1. **Cards**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
   - Stats cards: `h-[68px]` on CardHeader for alignment
   - Hover effect: `hover:shadow-md transition-shadow`

2. **Tables**: `Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`
   - Hover rows: `hover:bg-muted/50`
   - Actions column: `text-right` alignment

3. **Forms**: `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Label`
   - Validation errors: Show below fields with `text-destructive`
   - Layout: 2/3 main content + 1/3 sidebar for settings

4. **Buttons**: `Button` with variants
   - Primary action: `default` variant
   - Secondary: `outline` variant
   - Danger: `destructive` variant
   - Icon buttons: `ghost` variant + `size="sm"`

5. **Dialogs**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
   - Replace all `window.confirm()` with Dialog
   - Actions: Cancel (outline) + Confirm (default/destructive)

6. **Badges**: `Badge` with custom colors
   - Active/Success: `bg-green-100 text-green-800`
   - Inactive/Disabled: `bg-gray-100 text-gray-800`
   - Warning: `bg-yellow-100 text-yellow-800`
   - Danger: `bg-red-100 text-red-800`
   - Info: `bg-blue-100 text-blue-800`
   - Special types: `bg-purple-50 text-purple-700 border-purple-200`

7. **Notifications**: Toast system (top-right, 4s auto-dismiss)
   - Success: Green toast
   - Error: Red toast
   - Warning: Yellow toast
   - Info: Blue toast

### Icons (lucide-react)
Standard icons across admin:
- **Status**: `Check` (active), `X` (inactive), `Clock` (pending)
- **Actions**: `Eye` (view), `Edit` (edit), `Trash2` (delete), `Plus` (create)
- **Navigation**: `MapPin` (locations), `Car` (cars), `Users` (users), `Calendar` (bookings)
- **Types**: `Plane` (airport), `Star` (popular), `CheckCircle` (verified)

### Color Palette
- **Blue**: Primary, info, links
- **Green**: Success, active, confirmed
- **Red**: Danger, destructive, errors
- **Orange**: Warning, featured
- **Purple**: Special categories (airport)
- **Gray**: Inactive, disabled, muted

### Page Patterns
1. **Index Pages**: Stats cards → Filters (status/type/search) → Table → Pagination
2. **Create/Edit Pages**: Form (2-col layout) + Sidebar (settings/meta)
3. **Show Pages**: Header with actions → 2/3 info cards + 1/3 sidebar (meta)

### Code Cleanup Rules
- Remove unused imports after every edit
- Delete unused state variables, functions
- No `console.log()` in production code
- No commented-out code blocks
- Remove test buttons after testing features

## Known Issues
1. `promotions`: Use `where('status','active')` NOT `is_active`
2. `car_categories` Model: Missing `icon`, `is_active`, `sort_order` in `$fillable`
3. `resources/js/types/admin.ts`: Missing `Notification*` exports

**Examples:** `app/Models/Car.php`, `app/Http/Controllers/Admin/UserController.php`, `tests/Feature/Admin/AdminBookingsTest.php`, `resources/js/pages/admin/cars/index.tsx`
