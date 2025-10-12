# Car Management Admin Pages - Design Specification

**Version:** 1.0  
**Date:** October 12, 2025  
**Based on:** Existing admin page patterns (Locations, Promotions, Car Brands/Categories)

---

## 📋 Design Patterns Analysis

### Common UI Components (shadcn/ui)
- `AdminLayout` - Main layout với breadcrumbs
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Button` với variants: default, outline, ghost, destructive
- `Input`, `Textarea`, `Select`, `Checkbox`, `Label`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Badge` - Color-coded status indicators
- `Dialog` - Confirmation modals
- Icons from `lucide-react`

### Layout Patterns

#### 1. Index Pages Structure
```tsx
<AdminLayout breadcrumbs={breadcrumbs}>
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Title</h1>
      <p className="text-muted-foreground">Description</p>
    </div>
    <Button asChild>
      <Link href="/admin/resource/create">
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Link>
    </Button>
  </div>

  {/* Stats Cards (4 columns) */}
  <div className="grid gap-4 md:grid-cols-4">
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="h-[68px]">...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  </div>

  {/* Filters & Search */}
  <Card>
    <CardContent className="pt-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Select /> {/* Status Filter */}
        <Select /> {/* Type Filter */}
        <form>...</form> {/* Search */}
      </div>
    </CardContent>
  </Card>

  {/* Data Table */}
  <Card>
    <Table>...</Table>
  </Card>

  {/* Pagination */}
  <div className="flex items-center justify-between">...</div>
</AdminLayout>
```

#### 2. Create/Edit Pages Structure
```tsx
<AdminLayout breadcrumbs={breadcrumbs}>
  {/* Header with Back Button */}
  <div className="flex items-center gap-3">
    <Button variant="ghost" size="icon" asChild>
      <Link href="/admin/resource">
        <ChevronLeft className="h-5 w-5" />
      </Link>
    </Button>
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Title</h1>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
  </div>

  <form onSubmit={handleSubmit}>
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
            <CardDescription>Section description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form fields */}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar (1/3 width) */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checkboxes, selects */}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={processing}>
                {processing ? <Loader2 /> : <Save />}
                Save
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/resource">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </form>
</AdminLayout>
```

#### 3. Show Pages Structure
```tsx
<AdminLayout breadcrumbs={breadcrumbs}>
  {/* Header with Actions */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin/resource">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Title</h1>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleAction}>Action</Button>
      <Button variant="outline" asChild>
        <Link href="/admin/resource/:id/edit">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  </div>

  <div className="grid gap-6 lg:grid-cols-3">
    {/* Main Content (2/3 width) */}
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display fields */}
        </CardContent>
      </Card>
    </div>

    {/* Sidebar (1/3 width) */}
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ID, timestamps */}
        </CardContent>
      </Card>
    </div>
  </div>
</AdminLayout>
```

---

## 🎨 Color Coding System

### Status Badges
```tsx
// Car Status
available: 'bg-green-100 text-green-800 border-green-200'
rented: 'bg-blue-100 text-blue-800 border-blue-200'
maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
inactive: 'bg-gray-100 text-gray-800 border-gray-200'

// Verification Status
verified: 'bg-green-100 text-green-800'
pending: 'bg-yellow-100 text-yellow-800'

// Transmission
automatic: 'bg-blue-50 text-blue-700 border-blue-200'
manual: 'bg-purple-50 text-purple-700 border-purple-200'

// Fuel Type
petrol: 'bg-orange-50 text-orange-700'
diesel: 'bg-gray-50 text-gray-700'
electric: 'bg-green-50 text-green-700'
hybrid: 'bg-blue-50 text-blue-700'

// Special Indicators
is_delivery_available: 'bg-emerald-50 text-emerald-700'
expired_documents: 'bg-red-50 text-red-700'
needs_maintenance: 'bg-amber-50 text-amber-700'
```

### Icons (lucide-react)
```tsx
Car: <Car />
Status: <CheckCircle /> (active), <Clock /> (pending), <Wrench /> (maintenance)
Edit: <Edit />
Delete: <Trash2 />
View: <Eye />
Add: <Plus />
Back: <ChevronLeft />
Save: <Save />
Search: <Search />
Filter: <Filter />
Images: <Image />
Location: <MapPin />
Owner: <User />
Category: <Shapes />
Brand: <BadgeCheck />
```

---

## 🚗 Cars Specific Design

### Index Page (admin/cars/index.tsx)

**Stats Cards (4):**
1. Total Cars - `<Car />` icon, blue
2. Available for Rent - `<CheckCircle />` icon, green
3. Currently Rented - `<Key />` icon, blue
4. Under Maintenance - `<Wrench />` icon, yellow

**Filters:**
- Status: all | available | rented | maintenance | inactive
- Category: all | sedan | suv | hatchback | minivan | pickup
- Brand: all | toyota | honda | mazda | etc.
- Verification: all | verified | pending
- Search: by model, license plate, VIN

**Table Columns:**
1. Image (thumbnail)
2. Car (Brand + Model + Year)
3. Owner
4. Category
5. License Plate
6. Status Badge
7. Verified Badge
8. Daily Rate
9. Rental Count
10. Actions (View, Edit, Delete)

**Row Hover:** `hover:bg-muted/50`

---

### Create/Edit Page (admin/cars/create.tsx, edit.tsx)

**Form Sections (Cards):**

1. **Basic Information**
   - Owner (Select - owners only)
   - Brand (Select)
   - Category (Select)
   - Location (Select)
   - Model (Input)
   - Year (Number, 2018-2024)
   - Color (Input)
   - Seats (Select: 4,5,7,9)

2. **Vehicle Details**
   - License Plate (Input, unique)
   - VIN (Input, optional)
   - Transmission (Select: automatic, manual)
   - Fuel Type (Select: petrol, diesel, electric, hybrid)
   - Odometer (Number, km)

3. **Documents & Maintenance**
   - Insurance Expiry (Date)
   - Registration Expiry (Date)
   - Last Maintenance Date (Date)
   - Next Maintenance KM (Number)

4. **Pricing Configuration** (highlight với border-primary)
   - Hourly Rate (Number, VND)
   - Daily Rate (Number, VND)
   - Daily Hour Threshold (Number, default 10)
   - Deposit Amount (Number, VND)
   - Min Rental Hours (Number, default 4)
   - Overtime Fee Per Hour (Number, VND)

5. **Delivery Settings**
   - Is Delivery Available (Checkbox)
   - Delivery Fee Per KM (Number, VND)
   - Max Delivery Distance (Number, km)

6. **Description & Features**
   - Description (Textarea, 3 rows)
   - Features (Multi-checkbox)
     - GPS, Bluetooth, Backup Camera
     - Sunroof, USB Port, Aux Port
     - Air Conditioning, Spare Tire, Dashcam

**Sidebar:**
- Status (Select: available, maintenance, inactive)
- Is Verified (Checkbox, admin only)
- Sort Order (Number)
- Submit Button
- Cancel Button

**Preview Card in Sidebar:**
- Show calculated daily rate equivalent
- Example: "10 hours = ₫X,XXX,XXX"

---

### Show Page (admin/cars/show.tsx)

**Header Actions:**
- Toggle Status (available/maintenance/inactive)
- Toggle Verification
- Edit Button
- Delete Button (disabled if has active bookings)

**Main Content (2/3):**

1. **Car Information Card**
   - Image Gallery (horizontal scroll, 4 images)
   - Brand, Model, Year
   - License Plate, VIN
   - Color, Seats, Transmission, Fuel Type
   - Category Badge
   - Status Badge
   - Verified Badge

2. **Owner Information Card**
   - Owner name, email, phone
   - Link to owner profile

3. **Pricing & Rental Card**
   - Hourly Rate
   - Daily Rate
   - Threshold (10 hours)
   - Deposit Amount
   - Min Rental Hours
   - Overtime Fee
   - Delivery Available Badge
   - Delivery Fee, Max Distance

4. **Maintenance & Documents Card**
   - Odometer: X,XXX km
   - Insurance Expiry (warning if < 30 days)
   - Registration Expiry (warning if < 30 days)
   - Last Maintenance Date
   - Next Maintenance KM (warning if close)

5. **Performance Metrics Card**
   - Total Rentals: X
   - Average Rating: X.XX/5.00 (stars)

6. **Description Card**
   - Full description text
   - Features badges

**Sidebar (1/3):**

1. **Metadata Card**
   - Car ID
   - Location (with link)
   - Created At
   - Updated At

2. **Status Warnings Card** (conditional)
   - Red alert if documents expired
   - Yellow alert if maintenance due
   - Info if pending verification

3. **Quick Stats Card**
   - Views count (if tracked)
   - Wishlist count (if tracked)

---

## 📝 Form Validation Rules

```typescript
// Required fields
owner_id: required | exists:users,id,role,owner
category_id: required | exists:car_categories,id
brand_id: required | exists:car_brands,id
location_id: nullable | exists:locations,id
model: required | max:200
year: required | integer | between:2000,2030
license_plate: required | unique | max:20
seats: required | integer | between:2,20
transmission: required | in:automatic,manual
fuel_type: required | in:petrol,diesel,electric,hybrid

// Pricing (required)
hourly_rate: required | numeric | min:0
daily_rate: required | numeric | min:0
daily_hour_threshold: required | integer | min:1 | max:24
deposit_amount: required | numeric | min:0
min_rental_hours: required | integer | min:1

// Optional
vin: nullable | max:50 | unique
color: nullable | max:50
description: nullable | max:5000
odometer_km: nullable | numeric | min:0
insurance_expiry: nullable | date | after:today
registration_expiry: nullable | date | after:today
delivery_fee_per_km: nullable | numeric | min:0
max_delivery_distance: nullable | integer | min:1
```

---

## 🎯 Interactive Features

### 1. Pricing Calculator (in Create/Edit)
- Real-time calculation preview
- Show hourly vs daily comparison
- Example scenarios (6h, 12h, 24h, 48h)

### 2. Document Expiry Warnings
- Auto-highlight fields if < 30 days
- Show countdown: "Expires in X days"

### 3. Image Gallery (in Show)
- Horizontal scroll
- Click to view full size
- Primary image marked

### 4. Status Toggle
- Confirmation dialog
- Update without page reload
- Toast notification

### 5. Delete Confirmation
- Check for active bookings
- Show warning if has history
- Require confirmation

---

## 📱 Responsive Design

- **Desktop (lg):** 2/3 + 1/3 layout
- **Tablet (md):** Stacked cards
- **Mobile (sm):** Single column

---

## 🚀 Next Steps

1. Create `CarController.php` with full CRUD
2. Create Form Request validation classes
3. Build admin pages:
   - `index.tsx` - List with filters
   - `create.tsx` - Create form
   - `edit.tsx` - Edit form
   - `show.tsx` - Detail view
4. Add to sidebar navigation
5. Test all flows

---

**Ready to implement!** 🎨
