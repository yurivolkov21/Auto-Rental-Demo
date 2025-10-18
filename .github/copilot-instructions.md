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

## UI Design Strategy - Database-Driven Approach
**CRITICAL:** All UI designs MUST align with database schema fields. Always check migrations before designing forms/pages.

### Design Workflow:
1. **Read Migration First**: Check `database/migrations/*_create_{table}_table.php` for exact fields
2. **Check Model**: Verify `$fillable`, `$casts`, relationships in `app/Models/{Model}.php`
3. **Design UI**: Create forms/displays that match ALL database fields
4. **Sync TypeScript**: Update `resources/js/types/models/*.ts` interfaces

### Field-to-UI Mapping Rules:

**Text Fields:**
- `string()` → `<Input type="text" />`
- `text()` / `longText()` → `<Textarea />`
- `json()` → `<Textarea />` with JSON validation OR structured form fields

**Numeric Fields:**
- `integer()` / `unsignedInteger()` → `<Input type="number" step="1" />`
- `decimal(X,Y)` → `<Input type="number" step="0.01" />` (show formatted with currency/units)
- Pricing fields → Always format with `formatCurrency()` for VND

**Date/Time Fields:**
- `date()` → `<Input type="date" />`
- `datetime()` / `timestamp()` → `<Input type="datetime-local" />`
- `time()` → `<Input type="time" />`

**Boolean Fields:**
- `boolean()` → `<Checkbox />` or `<Switch />` (prefer Switch for settings)
- Show "Yes/No" or "Active/Inactive" in displays

**Enum Fields:**
- Read `enum('value1','value2')` from migration
- UI → `<Select>` with exact enum options
- Never hardcode options - derive from schema or constants
- Display → `<Badge>` with color coding by status

**Foreign Keys:**
- `foreignId('model_id')` → `<Select>` with related model options
- Load options from backend: `Model::all()->pluck('name', 'id')`
- Display → Show related model name, not just ID

**Nullable Fields:**
- `->nullable()` → Form field NOT required
- Add "(Optional)" label
- Handle null in display with fallback: `value ?? 'N/A'`

**Timestamps:**
- `timestamps()` → Auto-handled, show in "2 days ago" format or full datetime
- Use `created_at`, `updated_at` for audit trails

### Form Design Checklist:
- [ ] All required fields marked with `*`
- [ ] Optional fields labeled "(Optional)"
- [ ] Enum selects match migration values exactly
- [ ] Foreign key selects populated from database
- [ ] Decimal fields with correct step (0.01, 0.001, etc)
- [ ] Boolean fields as switches/checkboxes
- [ ] JSON fields with proper input (textarea or structured)
- [ ] Validation rules match migration constraints
- [ ] Error messages shown below each field

### Display/Show Page Checklist:
- [ ] All database fields displayed (except password, tokens)
- [ ] Formatted output (currency, dates, enums)
- [ ] Related models shown with names (not IDs)
- [ ] Nullable fields show "N/A" or empty state
- [ ] Timestamps in human-readable format
- [ ] Boolean fields as badges (Active/Inactive)

### Migration-to-Frontend Flow:
```
Migration field → Model $fillable → Controller validation → TypeScript type → UI component
```

**Example:**
```php
// Migration
$table->decimal('daily_rate', 10, 2);
$table->enum('status', ['available', 'rented', 'maintenance']);
$table->boolean('is_featured')->default(false);

// Model
protected $fillable = ['daily_rate', 'status', 'is_featured'];
protected $casts = ['daily_rate' => 'decimal:2', 'is_featured' => 'boolean'];

// TypeScript
interface Car {
  daily_rate: string;
  status: 'available' | 'rented' | 'maintenance';
  is_featured: boolean;
}

// UI
<Input type="number" step="0.01" /> // daily_rate
<Select options={['available','rented','maintenance']} /> // status
<Switch checked={is_featured} /> // is_featured
```

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

## Customer Pages Design System
**CRITICAL - All customer-facing pages MUST follow these design principles:**

### Design Philosophy
- **NO Decorative Icons**: Professional, clean look without frivolous icon clutter
- **Photo-First**: Large, high-quality car images take priority
- **Typography-Focused**: Clear hierarchy with Instrument Sans font
- **Premium Feel**: Inspired by Turo, Enterprise, Hertz - NOT cheap rental sites

### Layout Components
- **Layout**: `CustomerLayout` with navigation (from `@/layouts/customer/customer-layout`)
- **Header**: Logo, main nav, Sign In, Get Started button
- **Footer**: Links, contact info, social (minimal)

### Core Components (shadcn/ui + custom)
1. **CarCard**: Grid item for car listings
   - Large image (aspect-[4/3])
   - Category + Brand (small, uppercase)
   - Car name (text-xl, bold)
   - Rating stars (if available)
   - Specs: seats, transmission, fuel (text only)
   - Price: Large VND, gradient text
   - "View details" button (centered, with arrow)

2. **SearchWidget**: Hero search form
   - Location select (with airport badges)
   - Date inputs (pickup/return)
   - Large "Search Cars" button
   - Quick stats below

3. **BookingCalculator**: Sticky sidebar on car detail
   - Daily + Hourly rates (if available)
   - Date/time inputs
   - Location selects
   - Driver service (optional)
   - Real-time price updates
   - Large "Book Now" button

4. **CarFilterSidebar**: Filters on listing page
   - Categories (checkboxes)
   - Brands (checkboxes)
   - Price range (slider with VND)
   - Transmission (radio)
   - Seats (radio)
   - "Apply" + "Reset" buttons

### Currency Display
- **ALL prices in VND**: Use `formatCurrency()` from `@/lib/currency.ts`
- **Format**: "1.000.000₫" (thousand separators)
- **Compact**: "1TR₫" for large numbers (filter ranges)
- **NEVER use $** - this is Vietnam market

### Color Scheme (Customer Pages)
- **Primary Blue**: #2563EB (buttons, links, accents)
- **Gradients**: blue-600 to blue-700 (prices, CTAs)
- **Text**: gray-900 (headings), gray-600 (body), gray-500 (meta)
- **Backgrounds**: white cards on gray-50 body
- **Borders**: gray-100 (subtle), gray-200 (visible)

### Typography Hierarchy
- **Hero**: text-4xl/5xl, font-bold
- **Section Titles**: text-3xl, font-bold
- **Card Titles**: text-xl, font-bold
- **Body**: text-base, text-gray-600
- **Meta**: text-sm/xs, text-gray-500, uppercase for labels

### Spacing & Layout
- **Container**: max-w-7xl mx-auto px-4
- **Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (car cards)
- **Gaps**: gap-6 (grid), gap-4 (form fields)
- **Padding**: p-6 (cards), py-12/16 (sections)
- **Rounded**: rounded-xl (cards), rounded-lg (inputs/buttons)

### Animations & Interactions
- **Hover**: scale-110 (images, 700ms), shadow-xl → shadow-2xl (cards)
- **Transitions**: duration-300 (default), duration-500/700 (smooth)
- **Loading**: Skeleton screens, not spinners
- **Success**: Green toast notifications (top-right)

### Booking Flow UX
1. **Car Detail → Book Now**: Requires login (redirect to /login)
2. **Checkout (2 steps)**:
   - Step 1: Booking Details (dates, locations, driver, promo)
   - Step 2: Review & Confirm (payment method, submit)
3. **Confirmation**: Success page with booking reference

### Data Display Rules (Customer Pages)
- **Car Specs**: Show ALL available fields from migration (seats, transmission, fuel, year, mileage, color)
- **Pricing**: Show both hourly + daily rates if available
- **Availability**: Real-time status from database
- **Reviews**: Show rating, count, recent reviews with user names
- **Images**: Primary image + gallery (if multiple)
- **Location**: Full address + map (if coordinates available)

### Responsive Design
- **Mobile-first**: All components work on mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-friendly**: Buttons min 44x44px, form inputs large
- **Sticky elements**: Booking calculator on desktop only

## Known Issues
1. `promotions`: Use `where('status','active')` NOT `is_active`
2. `car_categories` Model: Missing `icon`, `is_active`, `sort_order` in `$fillable`
3. `resources/js/types/admin.ts`: Missing `Notification*` exports

**Examples:** `app/Models/Car.php`, `app/Http/Controllers/Admin/UserController.php`, `tests/Feature/Admin/AdminBookingsTest.php`, `resources/js/pages/admin/cars/index.tsx`
