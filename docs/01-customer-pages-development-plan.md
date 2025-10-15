# Customer Pages Development Plan

## Overview
This document outlines the comprehensive plan for developing customer-facing pages for the AutoRental application. The admin panel is complete, and this plan focuses on building the public rental platform for end users.

## Current Database Schema Analysis

### Available Models & Relationships
- **Car**: Related to Category, Brand, Location | Has many Bookings, Reviews
- **Booking**: Complete rental workflow with status management
- **Payment**: Multiple payment methods support
- **Promotion**: Discount and promo code logic
- **Location**: Pickup/dropoff support
- **DriverProfile**: Optional driver service
- **Review**: Customer feedback system
- **User**: Customer accounts with Fortify authentication

## Development Phases

### Phase 1: Core Rental Flow (HIGH PRIORITY)

#### 1. Home Page (`/`)
**Purpose**: Landing page with hero search and featured content

**Features**:
- Hero search widget (location, dates, time picker)
- Featured cars carousel (8 cars max)
- Popular categories grid with car counts
- Active promotions banner
- Customer testimonials/reviews
- Quick stats (total cars, locations, happy customers)

**Data Requirements**:
```php
[
    'featuredCars' => Car::with('category', 'brand')
        ->where('is_featured', true)
        ->limit(8)
        ->get(),
    'categories' => CarCategory::withCount('cars')->get(),
    'activePromotions' => Promotion::active()->limit(3)->get(),
    'stats' => [
        'totalCars' => Car::count(),
        'locations' => Location::count(),
        'happyCustomers' => Booking::where('status', 'completed')->count(),
    ],
]
```

#### 2. Car Listing Page (`/cars`)
**Purpose**: Browse and filter available cars

**Features**:
- Advanced filters:
  - Category selection
  - Brand selection
  - Price range slider
  - Features/specifications
  - Availability dates
- Sort options (price low-high, rating, popularity)
- Grid/list view toggle
- Pagination (12 cars per page)
- Quick view modal for car details
- Save to favorites (authenticated users)

**Filter Query Structure**:
```php
Car::query()
    ->with(['category', 'brand', 'location'])
    ->when($category, fn($q) => $q->where('category_id', $category))
    ->when($brand, fn($q) => $q->where('brand_id', $brand))
    ->whereBetween('price_per_day', [$minPrice, $maxPrice])
    ->where('status', 'available')
    ->orderBy($sortBy, $sortDirection)
    ->paginate(12);
```

#### 3. Car Detail Page (`/cars/{slug}`)
**Purpose**: Single car showcase with booking initiation

**Features**:
- Image gallery with lightbox
- Car specifications grid
- Features list with icons
- Pricing calculator (date selection → total calculation)
- Location/pickup selector
- Optional driver service selection
- Customer reviews & ratings
- Related cars section (same category)
- "Book Now" CTA with sticky sidebar

**Data Requirements**:
```php
[
    'car' => Car::with([
        'category',
        'brand',
        'location',
        'images',
        'reviews' => fn($q) => $q->with('user')->latest()->limit(10)
    ])->where('slug', $slug)->firstOrFail(),
    'relatedCars' => Car::where('category_id', $car->category_id)
        ->where('id', '!=', $car->id)
        ->limit(4)
        ->get(),
    'availableLocations' => Location::where('is_active', true)->get(),
    'drivers' => DriverProfile::where('is_available', true)->get(),
]
```

#### 4. Booking Flow (`/booking/checkout`)
**Purpose**: Multi-step booking process

**Steps**:
1. **Confirm Details**: Car, dates, location, duration
2. **Customer Info**: Login/register or continue as guest (collect name, email, phone, ID)
3. **Add-ons**: Optional driver service, insurance upgrades
4. **Apply Promotion**: Promo code input with validation
5. **Payment Method**: Select payment type (credit card, PayPal, bank transfer)
6. **Review & Confirm**: Final summary with terms acceptance

**Booking Calculation**:
```php
// Using BookingPricingService
$pricing = app(BookingPricingService::class)->calculatePrice([
    'car_id' => $carId,
    'pickup_datetime' => $pickupDate,
    'return_datetime' => $returnDate,
    'with_driver' => $withDriver,
    'promotion_code' => $promoCode,
]);

// Returns: base_price, driver_fee, discount, tax, total
```

**Validation Rules**:
- Pickup date >= today
- Return date > pickup date
- Car available for selected dates
- Valid promotion code (if provided)
- Customer age >= 21 (Vietnam driving requirement)

#### 5. Booking Confirmation (`/booking/{id}/confirmation`)
**Purpose**: Success page after payment

**Features**:
- Booking reference number
- Complete booking details (car, dates, location, pricing)
- Payment receipt with transaction ID
- Pickup instructions (address, contact, hours)
- Download PDF receipt button
- Add to calendar link (ICS file)
- Email confirmation sent notification
- Next steps guide

### Phase 2: User Account Area (MEDIUM PRIORITY)

#### 6. Customer Dashboard (`/dashboard`)
**Purpose**: User account overview

**Features**:
- Welcome message with user name
- Upcoming bookings section (3 most recent)
- Active rentals with countdown timer
- Quick stats (total bookings, total spent, loyalty points)
- Quick actions (browse cars, view all bookings, edit profile)
- Recent reviews section

#### 7. My Bookings (`/bookings`)
**Purpose**: Complete booking history management

**Tabs**:
- **Upcoming**: Future bookings with modify/cancel options
- **Active**: Currently renting (extend rental, contact support)
- **Completed**: Past bookings with review CTA
- **Canceled**: Canceled bookings with refund status

**Features per booking**:
- Status badge with color coding
- Car image and details
- Booking dates and location
- Total amount paid
- Action buttons (view details, download receipt, review, rebook)

#### 8. My Reviews (`/reviews`)
**Purpose**: Review management

**Features**:
- Pending reviews (completed bookings without review)
- Published reviews with car and date
- Edit/delete own reviews
- Review statistics (total reviews, average rating given)

#### 9. Profile Settings (`/settings`)
**Purpose**: Account management

**Sections**:
- **Personal Info**: Name, email, phone, address, date of birth
- **Password Change**: Current password, new password, confirm
- **Notification Preferences**: Email/SMS notifications toggles
- **Driver License**: Upload license image, license number, expiry date
- **Payment Methods**: Saved cards (if applicable)
- **Account Security**: Two-factor authentication, login history

### Phase 3: Content & Information Pages (LOW PRIORITY)

#### 10. About Us (`/about`)
**Purpose**: Company information and trust building

**Sections**:
- Company story and history
- Mission & vision statements
- Core values
- Team members (optional)
- Company milestones timeline
- Certifications and partnerships
- Why choose us (USPs)

#### 11. Services (`/services`)
**Purpose**: Detailed service offerings

**Services**:
- Car rental types (economy, luxury, SUV, etc.)
- Professional driver services
- Airport pickup/delivery
- Long-term rental packages
- Corporate rental solutions
- Wedding car rental
- Self-drive vs. with-driver comparison

#### 12. Locations (`/locations`)
**Purpose**: Office locations and coverage areas

**Features**:
- Interactive map with markers
- Location cards with:
  - Address and landmarks
  - Operating hours
  - Contact phone/email
  - Available car count
  - Photos
- Popular routes/destinations
- Coverage area map

#### 13. Blog (`/blog`)
**Purpose**: Content marketing and SEO

**Features**:
- Blog post listing with categories
- Featured posts
- Search functionality
- Categories/tags filter
- Related posts
- Social share buttons

**Content Ideas**:
- Travel guides (Da Nang, Hanoi, Saigon)
- Driving tips in Vietnam
- Car maintenance tips
- Seasonal travel recommendations
- Customer success stories

**Note**: Requires new `blogs` table migration:
```php
Schema::create('blogs', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('excerpt');
    $table->longText('content');
    $table->string('featured_image')->nullable();
    $table->string('category');
    $table->json('tags')->nullable();
    $table->foreignId('author_id')->constrained('users');
    $table->enum('status', ['draft', 'published'])->default('draft');
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
});
```

#### 14. Contact (`/contact`)
**Purpose**: Customer support and inquiries

**Features**:
- Contact form:
  - Name, email, phone
  - Subject selection (general, booking, support, partnership)
  - Message textarea
  - Captcha validation
- Office locations with map
- Contact details (phone, email, hours)
- FAQ accordion (common questions)
- Live chat widget integration (optional - Tawk.to or Intercom)

**Form Handling**:
```php
// Send email to support + save to contacts table
ContactRequest::create($validated);
Mail::to(config('mail.support_email'))->send(new ContactInquiry($data));
```

#### 15. Legal Pages

**Terms & Conditions (`/terms`)**:
- Rental agreement terms
- User responsibilities
- Cancellation policy
- Liability and insurance
- Payment terms
- Dispute resolution

**Privacy Policy (`/privacy`)**:
- Data collection practices
- Cookie policy
- Third-party services
- User rights (GDPR-style)
- Contact for privacy concerns

**Rental Agreement (`/rental-agreement`)**:
- Vehicle condition checklist
- Driver requirements
- Prohibited uses
- Damage policy
- Fuel policy

## Technical Implementation

### Route Structure

```php
// routes/web.php - Customer routes

// Public pages
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/services', [PageController::class, 'services'])->name('services');
Route::get('/locations', [LocationController::class, 'index'])->name('locations');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// Car browsing (public)
Route::prefix('cars')->name('cars.')->group(function () {
    Route::get('/', [CarController::class, 'index'])->name('index');
    Route::get('/{car:slug}', [CarController::class, 'show'])->name('show');
});

// Booking flow (guest allowed, auth optional)
Route::prefix('booking')->name('booking.')->group(function () {
    Route::post('/calculate', [BookingController::class, 'calculate'])->name('calculate');
    Route::get('/checkout', [BookingController::class, 'checkout'])->name('checkout');
    Route::post('/store', [BookingController::class, 'store'])->name('store');
    Route::get('/{booking}/confirmation', [BookingController::class, 'confirmation'])
        ->name('confirmation');
});

// Customer dashboard (auth required)
Route::middleware(['auth', 'role:customer'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::prefix('my')->name('my.')->group(function () {
        Route::get('/bookings', [MyBookingController::class, 'index'])->name('bookings');
        Route::get('/bookings/{booking}', [MyBookingController::class, 'show'])
            ->name('bookings.show');
        Route::post('/bookings/{booking}/cancel', [MyBookingController::class, 'cancel'])
            ->name('bookings.cancel');
        
        Route::get('/reviews', [MyReviewController::class, 'index'])->name('reviews');
        Route::post('/reviews', [MyReviewController::class, 'store'])->name('reviews.store');
    });
});

// Blog (if implemented)
Route::prefix('blog')->name('blog.')->group(function () {
    Route::get('/', [BlogController::class, 'index'])->name('index');
    Route::get('/{blog:slug}', [BlogController::class, 'show'])->name('show');
});
```

### Controllers to Create

```
app/Http/Controllers/
├── HomeController.php              # Landing page logic
├── CarController.php               # Public car browsing (index, show)
├── BookingController.php           # Customer booking flow
├── DashboardController.php         # Customer dashboard
├── MyBookingController.php         # Customer booking management
├── MyReviewController.php          # Customer reviews
├── LocationController.php          # Locations page
├── ContactController.php           # Contact form
├── PageController.php              # Static pages (about, services)
└── BlogController.php              # Blog posts (optional)
```

### React Pages Structure

```
resources/js/pages/
├── home.tsx                        # Landing page
├── about.tsx                       # About page
├── services.tsx                    # Services page
├── contact.tsx                     # Contact page
│
├── cars/
│   ├── index.tsx                   # Car listing with filters
│   └── show.tsx                    # Car detail page
│
├── booking/
│   ├── checkout.tsx                # Multi-step booking form
│   └── confirmation.tsx            # Booking success page
│
├── dashboard/
│   ├── index.tsx                   # Customer dashboard
│   ├── bookings/
│   │   ├── index.tsx              # Booking list
│   │   └── show.tsx               # Booking detail
│   └── reviews/
│       └── index.tsx              # Review management
│
├── locations/
│   └── index.tsx                   # Locations listing
│
└── blog/
    ├── index.tsx                   # Blog listing
    └── show.tsx                    # Single blog post
```

### Shared Components Library

```
resources/js/components/customer/
├── layout/
│   ├── CustomerLayout.tsx          # Main layout wrapper
│   ├── Header.tsx                  # Top navigation
│   ├── Footer.tsx                  # Footer with links
│   └── MobileMenu.tsx              # Mobile navigation drawer
│
├── search/
│   ├── SearchWidget.tsx            # Hero search form
│   ├── DatePicker.tsx              # Date range picker
│   └── LocationSelector.tsx        # Location dropdown
│
├── car/
│   ├── CarCard.tsx                 # Car listing item
│   ├── CarGrid.tsx                 # Grid container
│   ├── CarFilter.tsx               # Advanced filters sidebar
│   ├── CarSort.tsx                 # Sort dropdown
│   ├── CarGallery.tsx              # Image gallery with lightbox
│   └── CarSpecifications.tsx       # Specs table
│
├── booking/
│   ├── BookingCalculator.tsx       # Price calculation widget
│   ├── BookingStepper.tsx          # Multi-step progress
│   ├── BookingSummary.tsx          # Sticky price summary
│   ├── PaymentMethodSelector.tsx   # Payment options
│   └── PromotionCodeInput.tsx      # Promo code field
│
├── review/
│   ├── ReviewCard.tsx              # Single review display
│   ├── ReviewList.tsx              # Reviews container
│   ├── ReviewForm.tsx              # Review submission
│   └── RatingStars.tsx             # Star rating display/input
│
└── ui/
    ├── CategoryCard.tsx            # Category showcase
    ├── PromotionBanner.tsx         # Promo banner
    ├── Testimonial.tsx             # Customer testimonial
    ├── StatCard.tsx                # Statistics display
    └── Map.tsx                     # Location map component
```

### TypeScript Interfaces

```typescript
// resources/js/types/customer.ts

export interface SearchParams {
    location_id: number | null;
    pickup_date: string;
    pickup_time: string;
    return_date: string;
    return_time: string;
    category_id?: number;
}

export interface CarFilters {
    category_id?: number[];
    brand_id?: number[];
    price_min?: number;
    price_max?: number;
    features?: string[];
    sort_by?: 'price' | 'rating' | 'popularity';
    sort_direction?: 'asc' | 'desc';
}

export interface BookingCalculation {
    car_id: number;
    pickup_datetime: string;
    return_datetime: string;
    days: number;
    base_price: number;
    driver_fee: number;
    discount: number;
    tax: number;
    total: number;
    promotion?: Promotion;
}

export interface BookingRequest {
    car_id: number;
    location_id: number;
    pickup_datetime: string;
    return_datetime: string;
    with_driver: boolean;
    driver_id?: number;
    promotion_code?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_id_number: string;
    payment_method: string;
    terms_accepted: boolean;
}

export interface CustomerDashboard {
    user: User;
    upcomingBookings: Booking[];
    activeBookings: Booking[];
    stats: {
        totalBookings: number;
        totalSpent: number;
        pendingReviews: number;
    };
}
```

## Design System for Customer Pages

### Layout Guidelines

**CustomerLayout Structure**:
```tsx
<div className="min-h-screen flex flex-col">
    <Header /> {/* Logo, Navigation, Auth buttons */}
    <main className="flex-grow">
        {children}
    </main>
    <Footer /> {/* Links, Contact, Social */}
</div>
```

**Header Navigation**:
- Logo (link to home)
- Nav links: Home, Cars, Locations, Services, About, Contact
- User menu (authenticated): Dashboard, Bookings, Profile, Logout
- Auth buttons (guest): Login, Register
- Mobile: Hamburger menu

**Footer Sections**:
- Company info (logo, description)
- Quick links (About, Services, Locations, Blog)
- Legal (Terms, Privacy, Rental Agreement)
- Contact info (phone, email, address)
- Social media icons
- Newsletter signup (optional)

### Color Palette

- **Primary Blue**: `#3B82F6` - CTA buttons, links, accents
- **Green Success**: `#10B981` - Available status, confirmations
- **Orange Warning**: `#F59E0B` - Featured items, promotions
- **Red Danger**: `#EF4444` - Errors, cancellations, sold out
- **Gray Neutral**: `#6B7280` - Text, borders, backgrounds

### Typography

- **Headings**: `font-bold` with `text-2xl` to `text-5xl`
- **Body**: `font-normal text-base text-gray-700`
- **Small**: `text-sm text-gray-500` for meta info
- **Price**: `font-bold text-xl text-primary` for emphasis

### Component Patterns

#### Car Card
```tsx
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="relative h-48">
        <img src={car.image} alt={car.name} className="object-cover" />
        {car.is_featured && <Badge>Featured</Badge>}
    </div>
    <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{car.category.name}</span>
            <span>•</span>
            <span>{car.brand.name}</span>
        </div>
        <h3 className="font-bold text-lg mt-2">{car.name}</h3>
        <div className="flex items-center gap-2 mt-2">
            <RatingStars value={car.average_rating} />
            <span className="text-sm">({car.reviews_count})</span>
        </div>
        <div className="flex items-center justify-between mt-4">
            <div>
                <span className="font-bold text-xl text-primary">
                    ${car.price_per_day}
                </span>
                <span className="text-sm text-gray-500">/day</span>
            </div>
            <Button>Book Now</Button>
        </div>
    </CardContent>
</Card>
```

#### Search Widget
```tsx
<Card className="shadow-xl -mt-8 relative z-10">
    <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <LocationSelector />
            <DatePicker label="Pickup Date" />
            <DatePicker label="Return Date" />
            <Button size="lg" className="w-full">
                Search Cars
            </Button>
        </div>
    </CardContent>
</Card>
```

#### Booking Summary (Sticky Sidebar)
```tsx
<Card className="sticky top-4">
    <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
    </CardHeader>
    <CardContent>
        <div className="space-y-3">
            <div className="flex justify-between">
                <span>Car Rental ({days} days)</span>
                <span>${basePrice}</span>
            </div>
            {withDriver && (
                <div className="flex justify-between">
                    <span>Driver Service</span>
                    <span>${driverFee}</span>
                </div>
            )}
            {discount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Promotion Discount</span>
                    <span>-${discount}</span>
                </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total}</span>
            </div>
        </div>
        <Button className="w-full mt-4" size="lg">
            Confirm Booking
        </Button>
    </CardContent>
</Card>
```

### Responsive Design

- **Mobile (< 768px)**: Single column, drawer navigation, simplified filters
- **Tablet (768px - 1024px)**: 2-column grids, collapsible filters
- **Desktop (> 1024px)**: 3-4 column grids, sidebar filters, sticky elements

### Icons (lucide-react)

- **Search**: `Search`
- **Calendar**: `Calendar`
- **Location**: `MapPin`
- **Car**: `Car`
- **User**: `User`
- **Star**: `Star` (ratings)
- **Check**: `Check` (features)
- **Phone**: `Phone`
- **Mail**: `Mail`
- **Clock**: `Clock` (pickup time)

## Data Flow Examples

### Homepage Data Flow
```
User visits '/' 
→ HomeController::index()
→ Fetch: featured cars, categories with counts, active promotions, site stats
→ Inertia::render('home', [...data])
→ React Home component renders with TypeScript interfaces
```

### Car Search Flow
```
User fills search widget
→ POST /api/booking/calculate (AJAX)
→ Returns available cars + pricing
→ Redirect to /cars?location=X&dates=Y
→ CarController::index() with filters
→ Render car listing with results
```

### Booking Flow
```
User clicks "Book Now" on car detail
→ Add to session: car_id, dates, location
→ Redirect to /booking/checkout
→ Step 1: Review details
→ Step 2: Auth (or guest checkout)
→ Step 3: Add-ons selection
→ Step 4: Promotion code
→ Step 5: Payment method
→ POST /booking/store
→ Process payment (PayPal/Card)
→ Create Booking + Payment records
→ Send confirmation email
→ Redirect to /booking/{id}/confirmation
```

## Database Schema Considerations

### Existing Tables (Verified)
✅ `users` - Customer accounts  
✅ `cars` - Vehicle inventory  
✅ `car_categories` - Car types  
✅ `car_brands` - Manufacturers  
✅ `car_images` - Car photos  
✅ `locations` - Pickup/dropoff locations  
✅ `driver_profiles` - Available drivers  
✅ `bookings` - Rental records  
✅ `booking_charges` - Additional fees  
✅ `booking_promotions` - Applied discounts  
✅ `payments` - Payment transactions  
✅ `promotions` - Discount codes  
✅ `reviews` - Customer reviews  

### Potential New Tables

#### Contact Requests
```php
Schema::create('contact_requests', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->string('phone')->nullable();
    $table->enum('subject', ['general', 'booking', 'support', 'partnership']);
    $table->text('message');
    $table->enum('status', ['pending', 'replied', 'closed'])->default('pending');
    $table->foreignId('replied_by')->nullable()->constrained('users');
    $table->timestamp('replied_at')->nullable();
    $table->timestamps();
});
```

#### Blog Posts (Optional)
```php
Schema::create('blogs', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('excerpt');
    $table->longText('content');
    $table->string('featured_image')->nullable();
    $table->string('category');
    $table->json('tags')->nullable();
    $table->foreignId('author_id')->constrained('users');
    $table->enum('status', ['draft', 'published'])->default('draft');
    $table->integer('views')->default(0);
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
});
```

#### Favorites/Wishlist (Optional)
```php
Schema::create('favorites', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('car_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'car_id']);
});
```

#### Newsletter Subscriptions (Optional)
```php
Schema::create('newsletter_subscribers', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->string('token')->unique();
    $table->boolean('is_active')->default(true);
    $table->timestamp('verified_at')->nullable();
    $table->timestamps();
});
```

## SEO Considerations

### Meta Tags
Each page should include:
- `<title>` - Unique, descriptive titles
- `<meta name="description">` - 150-160 characters
- Open Graph tags for social sharing
- Canonical URLs

### Implementation with Inertia
```tsx
// In React pages
import { Head } from '@inertiajs/react';

<Head>
    <title>Luxury Car Rental in Vietnam | AutoRental</title>
    <meta name="description" content="Rent premium cars in Vietnam..." />
    <meta property="og:title" content="AutoRental - Car Rental Service" />
    <meta property="og:image" content="/images/og-home.jpg" />
</Head>
```

### URL Structure
- Clean URLs with slugs: `/cars/toyota-camry-2024`
- Canonical URLs for pagination
- Structured data (JSON-LD) for car listings

### Performance
- Image optimization (lazy loading, WebP format)
- Code splitting per route
- Caching strategy for static content
- CDN for assets

## Testing Strategy

### Backend Tests (Pest PHP)
```php
// tests/Feature/Customer/CarListingTest.php
test('customer can view car listing', function () {
    Car::factory()->count(15)->create();
    
    $response = $this->get(route('cars.index'));
    
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => 
        $page->component('cars/index')
             ->has('cars.data', 12) // Paginated
    );
});

// tests/Feature/Customer/BookingTest.php
test('customer can complete booking flow', function () {
    $car = Car::factory()->create(['status' => 'available']);
    
    $response = $this->post(route('booking.store'), [
        'car_id' => $car->id,
        'pickup_datetime' => now()->addDays(1),
        'return_datetime' => now()->addDays(3),
        'customer_email' => 'test@example.com',
        // ... other fields
    ]);
    
    $response->assertRedirect();
    $this->assertDatabaseHas('bookings', ['car_id' => $car->id]);
});
```

### Frontend Tests (Optional - Vitest/Jest)
- Component unit tests
- Integration tests for forms
- E2E tests for booking flow (Cypress/Playwright)

## Security Considerations

### Authentication
- Fortify handles login/register/password reset
- Guest checkout allowed with email verification
- Session management for booking flow

### Authorization
- Customers can only view/edit their own bookings
- Role middleware prevents admin access
- API rate limiting for public endpoints

### Payment Security
- PCI compliance for card payments
- PayPal SDK for secure transactions
- No card details stored locally
- HTTPS enforced in production

### Data Validation
- Server-side validation for all forms
- CSRF protection (Laravel default)
- XSS prevention (React escaping)
- SQL injection protection (Eloquent ORM)

## Deployment Checklist

### Before Launch
- [ ] Complete Phase 1 (core rental flow)
- [ ] Test booking flow end-to-end
- [ ] Verify payment integration (sandbox → live)
- [ ] Setup email templates (booking confirmation, etc.)
- [ ] Configure production .env variables
- [ ] Run database migrations on production
- [ ] Seed initial data (categories, locations, etc.)
- [ ] Setup CDN for static assets
- [ ] Configure caching (Redis/Memcached)
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] SSL certificate installed
- [ ] Backup strategy implemented
- [ ] Analytics tracking (Google Analytics, Meta Pixel)

### Post-Launch
- [ ] Monitor error logs
- [ ] Track conversion funnel
- [ ] Collect user feedback
- [ ] A/B test key pages
- [ ] Optimize slow queries
- [ ] Regular security audits

## Next Steps

### Immediate Actions
1. **Create CustomerLayout** - Base layout with header/footer
2. **Implement Home Page** - Landing page with search widget
3. **Build Car Listing** - Browse cars with filters
4. **Develop Car Detail** - Single car page with booking CTA
5. **Complete Booking Flow** - Multi-step checkout process

### Recommended Order
```
Week 1: CustomerLayout + Home Page + Car Listing
Week 2: Car Detail Page + Booking Calculator
Week 3: Booking Flow (Steps 1-3)
Week 4: Booking Flow (Steps 4-6) + Confirmation
Week 5: Customer Dashboard + My Bookings
Week 6: Content Pages (About, Services, Contact)
Week 7: Testing, Bug Fixes, Polish
Week 8: Launch Phase 1 to Production
```

## Resources & References

### Laravel Documentation
- Inertia.js: https://inertiajs.com/
- Fortify Authentication: https://laravel.com/docs/fortify
- Eloquent Relationships: https://laravel.com/docs/eloquent-relationships
- Validation: https://laravel.com/docs/validation

### React & UI Libraries
- shadcn/ui Components: https://ui.shadcn.com/
- Lucide Icons: https://lucide.dev/
- React Hook Form: https://react-hook-form.com/
- Date Picker: react-datepicker or similar

### Payment Integration
- PayPal PHP SDK: https://developer.paypal.com/sdk/
- Stripe (alternative): https://stripe.com/docs

### Design Inspiration
- Turo.com (peer-to-peer car rental)
- Getaround.com (car sharing platform)
- Enterprise.com (traditional rental)
- Booking.com (UI/UX patterns)

---

**Document Version**: 1.0  
**Last Updated**: October 15, 2025  
**Status**: Planning Phase  
**Next Review**: After Phase 1 completion
