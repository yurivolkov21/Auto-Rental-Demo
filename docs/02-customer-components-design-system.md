# Customer Components Design System

## Overview
This document defines the comprehensive component architecture and design system for customer-facing pages. It ensures consistency, reusability, and maintainability across all customer pages while maintaining a clear separation from admin components.

## Core Principles

### 1. Component Hierarchy
```
Layouts → Pages → Features → UI Components → Primitives
```

- **Layouts**: Top-level wrappers (header, footer, navigation)
- **Pages**: Route-specific containers (Inertia pages)
- **Features**: Business logic components (search widget, booking calculator)
- **UI Components**: Shared presentational components (car card, rating stars)
- **Primitives**: shadcn/ui base components (button, card, badge)

### 2. Design Philosophy
- **Mobile-first**: Design for mobile, enhance for desktop
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lazy loading, code splitting, optimized images
- **Consistency**: Unified spacing, colors, typography
- **Reusability**: DRY principle, composition over inheritance

### 3. Naming Convention
```
customer/[category]/[component-name].tsx

Examples:
- customer/layout/customer-header.tsx
- customer/car/car-card.tsx
- customer/booking/booking-summary.tsx
- customer/search/search-widget.tsx
```

## Directory Structure

```
resources/js/
├── components/
│   ├── customer/                    # Customer-specific components
│   │   ├── layout/                  # Layout components
│   │   │   ├── customer-header.tsx
│   │   │   ├── customer-footer.tsx
│   │   │   ├── mobile-menu.tsx
│   │   │   └── breadcrumb-nav.tsx
│   │   │
│   │   ├── search/                  # Search & filter components
│   │   │   ├── search-widget.tsx
│   │   │   ├── search-form.tsx
│   │   │   ├── date-range-picker.tsx
│   │   │   ├── time-picker.tsx
│   │   │   └── location-selector.tsx
│   │   │
│   │   ├── car/                     # Car-related components
│   │   │   ├── car-card.tsx
│   │   │   ├── car-card-skeleton.tsx
│   │   │   ├── car-grid.tsx
│   │   │   ├── car-list.tsx
│   │   │   ├── car-filter-sidebar.tsx
│   │   │   ├── car-sort-dropdown.tsx
│   │   │   ├── car-gallery.tsx
│   │   │   ├── car-specifications.tsx
│   │   │   ├── car-features-list.tsx
│   │   │   ├── car-price-badge.tsx
│   │   │   └── featured-car-badge.tsx
│   │   │
│   │   ├── booking/                 # Booking flow components
│   │   │   ├── booking-stepper.tsx
│   │   │   ├── booking-calculator.tsx
│   │   │   ├── booking-summary.tsx
│   │   │   ├── booking-details-card.tsx
│   │   │   ├── payment-method-selector.tsx
│   │   │   ├── promotion-code-input.tsx
│   │   │   ├── driver-service-card.tsx
│   │   │   └── terms-checkbox.tsx
│   │   │
│   │   ├── review/                  # Review components
│   │   │   ├── review-card.tsx
│   │   │   ├── review-list.tsx
│   │   │   ├── review-form.tsx
│   │   │   ├── rating-stars.tsx
│   │   │   ├── rating-summary.tsx
│   │   │   └── review-filter.tsx
│   │   │
│   │   ├── user/                    # User account components
│   │   │   ├── booking-history-card.tsx
│   │   │   ├── booking-status-badge.tsx
│   │   │   ├── profile-form.tsx
│   │   │   ├── password-change-form.tsx
│   │   │   └── user-stats-card.tsx
│   │   │
│   │   └── shared/                  # Shared customer components
│   │       ├── category-card.tsx
│   │       ├── promotion-banner.tsx
│   │       ├── testimonial-card.tsx
│   │       ├── stat-card.tsx
│   │       ├── location-card.tsx
│   │       ├── map-component.tsx
│   │       ├── contact-form.tsx
│   │       ├── newsletter-form.tsx
│   │       ├── social-share-buttons.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-spinner.tsx
│   │       └── error-message.tsx
│   │
│   ├── ui/                          # shadcn/ui primitives (shared)
│   └── admin/                       # Admin components (existing)
│
├── layouts/
│   ├── customer/
│   │   └── customer-layout.tsx      # Main customer layout
│   ├── admin/                       # Admin layouts (existing)
│   └── auth/                        # Auth layouts (existing)
│
└── pages/
    ├── customer/                    # Customer pages
    │   ├── home.tsx
    │   ├── about.tsx
    │   ├── cars/
    │   ├── booking/
    │   └── dashboard/
    └── admin/                       # Admin pages (existing)
```

## Component Specifications

### 1. Layout Components

#### CustomerHeader
**File**: `components/customer/layout/customer-header.tsx`

**Purpose**: Main navigation header with logo, menu, auth buttons

**Features**:
- Sticky header with backdrop blur on scroll
- Desktop: Horizontal navigation
- Mobile: Hamburger menu → drawer
- User menu (authenticated): Avatar + dropdown
- Auth buttons (guest): Login + Register

**Props Interface**:
```typescript
interface CustomerHeaderProps {
    user?: User | null;
    transparent?: boolean;  // For hero sections
    fixed?: boolean;        // Sticky positioning
}
```

**Design Specs**:
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
            <AppLogo className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/cars">Cars</NavLink>
            <NavLink href="/locations">Locations</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">
            {user ? (
                <UserMenu user={user} />
            ) : (
                <>
                    <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Sign Up</Link>
                    </Button>
                </>
            )}
        </div>

        {/* Mobile Menu Toggle */}
        <MobileMenuToggle />
    </div>
</header>
```

**Variants**:
- **Default**: White background, full navigation
- **Transparent**: Glass effect for hero sections
- **Scrolled**: Shadow appears after scroll

---

#### CustomerFooter
**File**: `components/customer/layout/customer-footer.tsx`

**Purpose**: Site footer with links, contact, social media

**Sections**:
1. **Company Info**: Logo, description, social icons
2. **Quick Links**: Navigation links in columns
3. **Contact**: Phone, email, address
4. **Newsletter**: Email signup form
5. **Legal**: Copyright, terms, privacy

**Design Specs**:
```tsx
<footer className="border-t bg-gray-50 dark:bg-gray-900">
    <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: Company */}
            <div>
                <AppLogo className="h-8 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                    Premium car rental service in Vietnam
                </p>
                <div className="flex gap-4">
                    <SocialIcon href="#" icon={Facebook} />
                    <SocialIcon href="#" icon={Instagram} />
                    <SocialIcon href="#" icon={Twitter} />
                </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                    <li><Link href="/cars">Browse Cars</Link></li>
                    <li><Link href="/locations">Locations</Link></li>
                    <li><Link href="/services">Services</Link></li>
                    <li><Link href="/about">About Us</Link></li>
                </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
                <h3 className="font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        +84 123 456 789
                    </li>
                    <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        info@autorental.vn
                    </li>
                </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div>
                <h3 className="font-semibold mb-4">Newsletter</h3>
                <NewsletterForm />
            </div>
        </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 AutoRental. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/rental-agreement">Rental Agreement</Link>
            </div>
        </div>
    </div>
</footer>
```

---

### 2. Search Components

#### SearchWidget
**File**: `components/customer/search/search-widget.tsx`

**Purpose**: Hero search form (location, dates, time)

**Features**:
- 4-column grid (desktop) / 1-column (mobile)
- Real-time availability check
- Date validation (pickup < return)
- Persistent state in URL params

**Props Interface**:
```typescript
interface SearchWidgetProps {
    locations: Location[];
    initialValues?: SearchParams;
    onSearch: (params: SearchParams) => void;
    variant?: 'hero' | 'inline';
}

interface SearchParams {
    location_id: number | null;
    pickup_date: string;
    pickup_time: string;
    return_date: string;
    return_time: string;
}
```

**Design Specs**:
```tsx
<Card className="shadow-xl">
    <CardContent className="p-6">
        <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Location Selector */}
                <div>
                    <Label>Pickup Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                    {loc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Pickup Date & Time */}
                <div>
                    <Label>Pickup Date & Time</Label>
                    <DateTimePicker
                        value={pickupDate}
                        onChange={setPickupDate}
                        minDate={new Date()}
                    />
                </div>

                {/* Return Date & Time */}
                <div>
                    <Label>Return Date & Time</Label>
                    <DateTimePicker
                        value={returnDate}
                        onChange={setReturnDate}
                        minDate={pickupDate}
                    />
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <Button type="submit" size="lg" className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Search Cars
                    </Button>
                </div>
            </div>
        </form>
    </CardContent>
</Card>
```

**Variants**:
- **Hero**: Large size, prominent shadow, used on homepage
- **Inline**: Compact size, used on listing pages for refining search

---

#### DateRangePicker
**File**: `components/customer/search/date-range-picker.tsx`

**Purpose**: Dual calendar for pickup/return date selection

**Features**:
- Calendar with date range selection
- Disabled dates (past dates, unavailable dates)
- Min/max rental duration validation
- Popular presets (1 day, 3 days, 1 week)

**Props Interface**:
```typescript
interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    minDays?: number;
    maxDays?: number;
}

interface DateRange {
    from: Date | null;
    to: Date | null;
}
```

---

### 3. Car Components

#### CarCard
**File**: `components/customer/car/car-card.tsx`

**Purpose**: Display car in grid/list view with key info

**Features**:
- Car image with lazy loading
- Category & brand tags
- Rating stars + review count
- Price per day
- Feature icons (seats, transmission, fuel)
- "Book Now" CTA
- Favorite button (authenticated users)
- Featured badge overlay

**Props Interface**:
```typescript
interface CarCardProps {
    car: Car;
    view?: 'grid' | 'list';
    showFavorite?: boolean;
    onBook?: (car: Car) => void;
}
```

**Design Specs**:
```tsx
<Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
    {/* Image Container */}
    <div className="relative h-48 overflow-hidden">
        <img
            src={car.primary_image}
            alt={car.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
        />
        
        {/* Featured Badge */}
        {car.is_featured && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Featured
            </Badge>
        )}

        {/* Favorite Button */}
        {showFavorite && (
            <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 left-2 bg-white/80 hover:bg-white"
            >
                <Heart className="h-4 w-4" />
            </Button>
        )}
    </div>

    <CardContent className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{car.category.name}</span>
            <Separator orientation="vertical" className="h-3" />
            <span>{car.brand.name}</span>
        </div>

        {/* Car Name */}
        <h3 className="font-bold text-lg mb-2 line-clamp-1">
            {car.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
            <RatingStars value={car.average_rating} size="sm" />
            <span className="text-sm text-muted-foreground">
                ({car.reviews_count} reviews)
            </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{car.seats} seats</span>
            </div>
            <div className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span>{car.transmission}</span>
            </div>
            <div className="flex items-center gap-1">
                <Fuel className="h-4 w-4" />
                <span>{car.fuel_type}</span>
            </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                        ${car.price_per_day}
                    </span>
                    <span className="text-sm text-muted-foreground">/day</span>
                </div>
                {car.discounted_price && (
                    <span className="text-sm text-muted-foreground line-through">
                        ${car.original_price}
                    </span>
                )}
            </div>
            <Button onClick={() => onBook?.(car)}>
                Book Now
            </Button>
        </div>
    </CardContent>
</Card>
```

**List View Variant**:
```tsx
// Horizontal layout: Image (left 30%) + Content (right 70%)
<Card className="flex">
    <div className="w-1/3">
        <img src={car.image} className="h-full object-cover" />
    </div>
    <CardContent className="w-2/3 p-4">
        {/* Same content but horizontal layout */}
    </CardContent>
</Card>
```

---

#### CarFilterSidebar
**File**: `components/customer/car/car-filter-sidebar.tsx`

**Purpose**: Advanced filtering options for car search

**Filters**:
1. **Category**: Checkbox list
2. **Brand**: Checkbox list (collapsible)
3. **Price Range**: Dual slider
4. **Features**: Checkbox list (GPS, Bluetooth, etc.)
5. **Seats**: Radio buttons (2-4, 5-7, 8+)
6. **Transmission**: Radio buttons (automatic, manual)
7. **Fuel Type**: Checkbox list

**Props Interface**:
```typescript
interface CarFilterSidebarProps {
    filters: CarFilters;
    categories: CarCategory[];
    brands: CarBrand[];
    onFilterChange: (filters: CarFilters) => void;
    onReset: () => void;
}

interface CarFilters {
    category_ids: number[];
    brand_ids: number[];
    price_min: number;
    price_max: number;
    features: string[];
    seats: string | null;
    transmission: string | null;
    fuel_type: string[];
}
```

**Design Specs**:
```tsx
<Card className="sticky top-20">
    <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filters</CardTitle>
        <Button variant="ghost" size="sm" onClick={onReset}>
            Reset All
        </Button>
    </CardHeader>
    <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
            <h4 className="font-medium mb-3">Category</h4>
            <div className="space-y-2">
                {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2">
                        <Checkbox
                            checked={filters.category_ids.includes(cat.id)}
                            onCheckedChange={(checked) => 
                                handleCategoryToggle(cat.id, checked)
                            }
                        />
                        <span className="text-sm">{cat.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            ({cat.cars_count})
                        </span>
                    </label>
                ))}
            </div>
        </div>

        <Separator />

        {/* Price Range Filter */}
        <div>
            <h4 className="font-medium mb-3">Price per Day</h4>
            <PriceRangeSlider
                min={0}
                max={500}
                value={[filters.price_min, filters.price_max]}
                onValueChange={handlePriceChange}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>${filters.price_min}</span>
                <span>${filters.price_max}</span>
            </div>
        </div>

        <Separator />

        {/* Features Filter */}
        <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h4 className="font-medium">Features</h4>
                <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
                {FEATURE_OPTIONS.map((feature) => (
                    <label key={feature} className="flex items-center gap-2">
                        <Checkbox
                            checked={filters.features.includes(feature)}
                            onCheckedChange={(checked) =>
                                handleFeatureToggle(feature, checked)
                            }
                        />
                        <span className="text-sm">{feature}</span>
                    </label>
                ))}
            </CollapsibleContent>
        </Collapsible>

        {/* Apply Button (Mobile) */}
        <Button className="w-full md:hidden" onClick={handleApply}>
            Apply Filters
        </Button>
    </CardContent>
</Card>
```

---

#### CarGallery
**File**: `components/customer/car/car-gallery.tsx`

**Purpose**: Image gallery with lightbox for car detail page

**Features**:
- Main large image display
- Thumbnail strip below (horizontal scroll)
- Lightbox modal on click
- Navigation arrows (prev/next)
- Zoom on hover
- Image counter (1/8)

**Props Interface**:
```typescript
interface CarGalleryProps {
    images: CarImage[];
    carName: string;
}
```

**Design Specs**:
```tsx
<div className="space-y-4">
    {/* Main Image */}
    <div 
        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
        onClick={openLightbox}
    >
        <img
            src={images[currentIndex].url}
            alt={`${carName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Image Counter */}
        <Badge className="absolute bottom-4 right-4 bg-black/60 text-white">
            {currentIndex + 1} / {images.length}
        </Badge>

        {/* Navigation Arrows */}
        <Button
            size="icon"
            variant="ghost"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80"
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
        >
            <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80"
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
        >
            <ChevronRight className="h-6 w-6" />
        </Button>
    </div>

    {/* Thumbnail Strip */}
    <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
            <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
                    currentIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                )}
            >
                <img
                    src={image.thumbnail_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                />
            </button>
        ))}
    </div>

    {/* Lightbox Dialog */}
    <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl">
            <img
                src={images[currentIndex].url}
                alt={`${carName} - Full size`}
                className="w-full h-auto"
            />
        </DialogContent>
    </Dialog>
</div>
```

---

### 4. Booking Components

#### BookingCalculator
**File**: `components/customer/booking/booking-calculator.tsx`

**Purpose**: Real-time price calculation widget on car detail page

**Features**:
- Date range selector
- Location picker
- Driver service toggle
- Promotion code input
- Live price breakdown
- "Proceed to Checkout" CTA

**Props Interface**:
```typescript
interface BookingCalculatorProps {
    car: Car;
    locations: Location[];
    drivers: DriverProfile[];
    onProceed: (booking: BookingRequest) => void;
}
```

**Design Specs**:
```tsx
<Card className="sticky top-20">
    <CardHeader>
        <CardTitle>Book This Car</CardTitle>
        <CardDescription>Select your rental details</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
        {/* Location */}
        <div>
            <Label>Pickup Location</Label>
            <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        {/* Dates */}
        <div>
            <Label>Rental Period</Label>
            <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                minDate={new Date()}
            />
        </div>

        {/* Driver Service */}
        <div className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                    <p className="font-medium text-sm">With Driver</p>
                    <p className="text-xs text-muted-foreground">
                        Professional driver service
                    </p>
                </div>
            </div>
            <Switch
                checked={withDriver}
                onCheckedChange={setWithDriver}
            />
        </div>

        {withDriver && (
            <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                    {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} - ⭐ {driver.rating}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                    Car rental ({days} days)
                </span>
                <span className="font-medium">${basePrice}</span>
            </div>
            
            {withDriver && (
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Driver service</span>
                    <span className="font-medium">${driverFee}</span>
                </div>
            )}

            {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                    <span>Promotion discount</span>
                    <span>-${discount}</span>
                </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                    ${total}
                </span>
            </div>
        </div>

        {/* Promotion Code */}
        <PromotionCodeInput
            value={promoCode}
            onChange={setPromoCode}
            onApply={handleApplyPromo}
        />

        {/* CTA Button */}
        <Button
            size="lg"
            className="w-full"
            onClick={handleProceed}
            disabled={!dateRange.from || !dateRange.to}
        >
            Proceed to Checkout
        </Button>

        {/* Trust Indicators */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
            <p className="flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" />
                Secure payment
            </p>
            <p>Free cancellation up to 24 hours before pickup</p>
        </div>
    </CardContent>
</Card>
```

---

#### BookingStepper
**File**: `components/customer/booking/booking-stepper.tsx`

**Purpose**: Multi-step progress indicator for checkout flow

**Steps**:
1. Details
2. Customer Info
3. Add-ons
4. Payment
5. Confirmation

**Props Interface**:
```typescript
interface BookingStepperProps {
    currentStep: number;
    steps: BookingStep[];
}

interface BookingStep {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
}
```

**Design Specs**:
```tsx
<div className="w-full py-6">
    <div className="flex items-center justify-between">
        {steps.map((step, index) => (
            <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-semibold border-2 transition-colors",
                            step.completed
                                ? "bg-primary text-white border-primary"
                                : currentStep === step.id
                                ? "bg-primary/10 text-primary border-primary"
                                : "bg-gray-100 text-gray-400 border-gray-200"
                        )}
                    >
                        {step.completed ? (
                            <Check className="h-5 w-5" />
                        ) : (
                            step.id
                        )}
                    </div>
                    <p className="mt-2 text-xs font-medium text-center">
                        {step.title}
                    </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                    <div
                        className={cn(
                            "flex-1 h-0.5 mx-2 transition-colors",
                            step.completed
                                ? "bg-primary"
                                : "bg-gray-200"
                        )}
                    />
                )}
            </React.Fragment>
        ))}
    </div>
</div>
```

---

### 5. Review Components

#### RatingStars
**File**: `components/customer/review/rating-stars.tsx`

**Purpose**: Display or input star ratings

**Modes**:
- **Display**: Show rating as filled stars (read-only)
- **Input**: Interactive star selection for review form

**Props Interface**:
```typescript
interface RatingStarsProps {
    value: number;           // 0-5
    onChange?: (value: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
    showValue?: boolean;     // Show "4.5" text next to stars
}
```

**Design Specs**:
```tsx
<div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
        <button
            key={star}
            type="button"
            onClick={() => !readonly && onChange?.(star)}
            disabled={readonly}
            className={cn(
                "transition-colors",
                !readonly && "cursor-pointer hover:scale-110"
            )}
        >
            <Star
                className={cn(
                    size === 'sm' && "h-3 w-3",
                    size === 'md' && "h-4 w-4",
                    size === 'lg' && "h-6 w-6",
                    star <= value
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-none text-gray-300"
                )}
            />
        </button>
    ))}
    {showValue && (
        <span className="text-sm font-medium ml-1">
            {value.toFixed(1)}
        </span>
    )}
</div>
```

---

#### ReviewCard
**File**: `components/customer/review/review-card.tsx`

**Purpose**: Display single review with user info, rating, comment

**Features**:
- User avatar + name
- Rating stars
- Review date (relative time)
- Review text (expandable if long)
- Helpful votes (optional)
- Response from owner (optional)

**Props Interface**:
```typescript
interface ReviewCardProps {
    review: Review;
    showCarInfo?: boolean;    // Show car name/image
    showActions?: boolean;     // Edit/delete for own reviews
    onEdit?: (review: Review) => void;
    onDelete?: (review: Review) => void;
}
```

**Design Specs**:
```tsx
<Card>
    <CardContent className="p-4">
        <div className="flex items-start gap-4">
            {/* User Avatar */}
            <Avatar>
                <AvatarImage src={review.user.avatar} />
                <AvatarFallback>
                    {review.user.name.charAt(0)}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="font-semibold">{review.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(review.created_at)} ago
                        </p>
                    </div>
                    {showActions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onEdit?.(review)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDelete?.(review)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Rating */}
                <RatingStars value={review.rating} size="sm" readonly />

                {/* Review Text */}
                <p className="mt-2 text-sm text-gray-700">
                    {review.comment}
                </p>

                {/* Car Info (if shown) */}
                {showCarInfo && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <img
                            src={review.car.image}
                            alt={review.car.name}
                            className="w-12 h-12 object-cover rounded"
                        />
                        <span>{review.car.name}</span>
                    </div>
                )}

                {/* Helpful Votes (Optional) */}
                <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful ({review.helpful_count})
                    </Button>
                </div>
            </div>
        </div>
    </CardContent>
</Card>
```

---

### 6. Shared Components

#### CategoryCard
**File**: `components/customer/shared/category-card.tsx`

**Purpose**: Display car category with icon, count, link

**Design Specs**:
```tsx
<Link href={`/cars?category=${category.id}`}>
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-6 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon 
                    iconNode={getCategoryIcon(category.icon)} 
                    className="h-8 w-8 text-primary"
                />
            </div>

            {/* Category Name */}
            <h3 className="font-semibold text-lg mb-2">
                {category.name}
            </h3>

            {/* Car Count */}
            <p className="text-sm text-muted-foreground">
                {category.cars_count} cars available
            </p>

            {/* Arrow Icon */}
            <ArrowRight className="h-4 w-4 mx-auto mt-4 text-primary group-hover:translate-x-1 transition-transform" />
        </CardContent>
    </Card>
</Link>
```

---

#### EmptyState
**File**: `components/customer/shared/empty-state.tsx`

**Purpose**: Show when no results/data available

**Props Interface**:
```typescript
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}
```

**Design Specs**:
```tsx
<div className="flex flex-col items-center justify-center py-12 px-4">
    {/* Icon */}
    <div className="w-20 h-20 mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <Search className="h-10 w-10 text-gray-400" />}
    </div>

    {/* Title */}
    <h3 className="text-xl font-semibold mb-2">{title}</h3>

    {/* Description */}
    {description && (
        <p className="text-center text-muted-foreground max-w-md mb-6">
            {description}
        </p>
    )}

    {/* Action Button */}
    {action && (
        <Button asChild={!!action.href} onClick={action.onClick}>
            {action.href ? (
                <Link href={action.href}>{action.label}</Link>
            ) : (
                action.label
            )}
        </Button>
    )}
</div>
```

---

## Design Tokens

### Color Palette
```typescript
// tailwind.config.ts
export const colors = {
    primary: {
        DEFAULT: '#3B82F6',      // Blue
        foreground: '#FFFFFF',
        50: '#EFF6FF',
        100: '#DBEAFE',
        500: '#3B82F6',
        600: '#2563EB',
        900: '#1E3A8A',
    },
    success: {
        DEFAULT: '#10B981',      // Green
        foreground: '#FFFFFF',
        50: '#ECFDF5',
        500: '#10B981',
    },
    warning: {
        DEFAULT: '#F59E0B',      // Orange
        foreground: '#FFFFFF',
        50: '#FFFBEB',
        500: '#F59E0B',
    },
    destructive: {
        DEFAULT: '#EF4444',      // Red
        foreground: '#FFFFFF',
        50: '#FEF2F2',
        500: '#EF4444',
    },
};
```

### Typography Scale
```typescript
export const typography = {
    // Headings
    h1: 'text-5xl font-bold',           // Hero titles
    h2: 'text-4xl font-bold',           // Section titles
    h3: 'text-3xl font-bold',           // Subsection titles
    h4: 'text-2xl font-semibold',       // Card titles
    h5: 'text-xl font-semibold',        // Small headers
    h6: 'text-lg font-semibold',        // Label headers

    // Body
    body: 'text-base',                  // Default text
    small: 'text-sm',                   // Meta info
    xs: 'text-xs',                      // Fine print

    // Special
    price: 'text-2xl font-bold text-primary',
    badge: 'text-xs font-medium',
};
```

### Spacing Scale
```typescript
export const spacing = {
    section: 'py-16 md:py-24',          // Section padding
    container: 'px-4 md:px-6 lg:px-8',  // Container padding
    card: 'p-4 md:p-6',                 // Card padding
    gap: {
        xs: 'gap-2',
        sm: 'gap-4',
        md: 'gap-6',
        lg: 'gap-8',
        xl: 'gap-12',
    },
};
```

### Border Radius
```typescript
export const borderRadius = {
    sm: '0.375rem',    // 6px - Badges, tags
    md: '0.5rem',      // 8px - Cards, buttons
    lg: '0.75rem',     // 12px - Modals
    xl: '1rem',        // 16px - Hero sections
    full: '9999px',    // Pills, avatars
};
```

### Shadow Scale
```typescript
export const shadows = {
    sm: 'shadow-sm',              // Subtle elevation
    md: 'shadow-md',              // Cards
    lg: 'shadow-lg',              // Modals, popovers
    xl: 'shadow-xl',              // Hero elements
    hover: 'hover:shadow-lg',     // Interactive elements
};
```

---

## Responsive Breakpoints

```typescript
export const breakpoints = {
    sm: '640px',     // Mobile landscape
    md: '768px',     // Tablet portrait
    lg: '1024px',    // Tablet landscape / small desktop
    xl: '1280px',    // Desktop
    '2xl': '1536px', // Large desktop
};

// Usage patterns:
// Mobile-first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
```

---

## Accessibility Standards

### Keyboard Navigation
- All interactive elements must be focusable
- Visible focus indicators (ring-2 ring-primary)
- Tab order follows visual order
- Escape key closes modals/dropdowns

### Screen Readers
- Semantic HTML elements (nav, main, article, etc.)
- ARIA labels for icon-only buttons
- Alt text for all images
- Live regions for dynamic content (toast notifications)

### Color Contrast
- Minimum 4.5:1 ratio for normal text
- Minimum 3:1 ratio for large text (18px+)
- Test with tools: Lighthouse, axe DevTools

### Examples
```tsx
// Button with icon only
<Button size="icon" aria-label="Add to favorites">
    <Heart className="h-4 w-4" />
</Button>

// Image with alt text
<img 
    src={car.image} 
    alt={`${car.brand.name} ${car.name} exterior view`}
    loading="lazy"
/>

// Form input
<div>
    <Label htmlFor="email">Email Address</Label>
    <Input 
        id="email" 
        type="email" 
        aria-required="true"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? "email-error" : undefined}
    />
    {errors.email && (
        <p id="email-error" className="text-sm text-destructive" role="alert">
            {errors.email}
        </p>
    )}
</div>
```

---

## Performance Optimization

### Image Optimization
```tsx
// Use Next.js Image or similar optimization
<img
    src={car.image}
    alt={car.name}
    loading="lazy"                    // Native lazy loading
    decoding="async"                  // Non-blocking decode
    className="w-full h-48 object-cover"
/>

// Responsive images
<img
    src={car.image_large}
    srcSet={`
        ${car.image_small} 400w,
        ${car.image_medium} 800w,
        ${car.image_large} 1200w
    `}
    sizes="(max-width: 768px) 100vw, 50vw"
    alt={car.name}
/>
```

### Code Splitting
```tsx
// Lazy load heavy components
const CarGallery = lazy(() => import('@/components/customer/car/car-gallery'));

// Use Suspense boundary
<Suspense fallback={<CarGallerySkeleton />}>
    <CarGallery images={car.images} />
</Suspense>
```

### Skeleton Loading
```tsx
// Show skeleton while data loads
{loading ? (
    <CarCardSkeleton />
) : (
    <CarCard car={car} />
)}

// Skeleton component
export function CarCardSkeleton() {
    return (
        <Card>
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    );
}
```

---

## Component Development Workflow

### 1. Create Component File
```bash
# Navigate to appropriate directory
cd resources/js/components/customer/car

# Create component file
touch car-card.tsx
```

### 2. Define Props Interface
```typescript
interface CarCardProps {
    car: Car;
    view?: 'grid' | 'list';
    showFavorite?: boolean;
    onBook?: (car: Car) => void;
}
```

### 3. Build Component
```tsx
export function CarCard({ car, view = 'grid', showFavorite, onBook }: CarCardProps) {
    // Component logic
    return (
        // JSX
    );
}
```

### 4. Export from Index (if needed)
```typescript
// components/customer/car/index.ts
export { CarCard } from './car-card';
export { CarGrid } from './car-grid';
export { CarFilter } from './car-filter-sidebar';
```

### 5. Use in Page
```tsx
import { CarCard } from '@/components/customer/car/car-card';

export default function CarsIndex({ cars }: PageProps) {
    return (
        <CustomerLayout>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <CarCard key={car.id} car={car} />
                ))}
            </div>
        </CustomerLayout>
    );
}
```

---

## Testing Strategy

### Component Testing
```tsx
// car-card.test.tsx
import { render, screen } from '@testing-library/react';
import { CarCard } from './car-card';

describe('CarCard', () => {
    const mockCar = {
        id: 1,
        name: 'Toyota Camry 2024',
        price_per_day: 50,
        // ... other fields
    };

    it('renders car name', () => {
        render(<CarCard car={mockCar} />);
        expect(screen.getByText('Toyota Camry 2024')).toBeInTheDocument();
    });

    it('calls onBook when button clicked', () => {
        const onBook = jest.fn();
        render(<CarCard car={mockCar} onBook={onBook} />);
        
        screen.getByText('Book Now').click();
        expect(onBook).toHaveBeenCalledWith(mockCar);
    });
});
```

---

## Conclusion

This design system provides a comprehensive foundation for building consistent, accessible, and performant customer-facing components. Key takeaways:

1. **Consistency**: Use shared design tokens (colors, spacing, typography)
2. **Reusability**: Build composable components with clear props interfaces
3. **Accessibility**: Follow WCAG standards for all interactive elements
4. **Performance**: Implement lazy loading, skeletons, image optimization
5. **Maintainability**: Organize components by feature, use TypeScript

By following these guidelines, the customer pages will have a cohesive look and feel that matches the quality of the admin panel while providing an excellent user experience.

---

**Document Version**: 1.0  
**Last Updated**: October 15, 2025  
**Status**: Design Phase  
**Next Steps**: Begin implementing layout components (CustomerLayout, Header, Footer)
