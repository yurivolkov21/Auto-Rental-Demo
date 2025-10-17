/**
 * Customer Pages TypeScript Types
 * Clean, professional type definitions for customer-facing features
 */

import type {
    Car,
    CarCategory,
    CarBrand,
    Location,
    Promotion,
    User,
    Booking,
} from './index.d';
import type { DriverProfile } from './models/driver-profile';
import type { Review } from './models/review';

// ==========================================
// Home Page Types
// ==========================================

export interface HomePageProps {
    featuredCars: Car[];
    categories: (CarCategory & {
        cars_count: number;
    })[];
    activePromotions: Promotion[];
    stats: {
        totalCars: number;
        locations: number;
        happyCustomers: number;
    };
}

// ==========================================
// Search & Filter Types
// ==========================================

export interface SearchParams {
    location_id: number | null;
    pickup_date: string;
    pickup_time: string;
    return_date: string;
    return_time: string;
    category_id?: number;
}

export interface CarFilters {
    category_ids?: number[];
    brand_ids?: number[];
    price_min?: number;
    price_max?: number;
    seats?: string | null;
    transmission?: string | null;
    fuel_type?: string[];
    sort_by?: 'price' | 'rating' | 'popularity';
    sort_direction?: 'asc' | 'desc';
}

// ==========================================
// Car Listing Types
// ==========================================

export interface CarListingPageProps {
    cars: {
        data: Car[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: CarCategory[];
    brands: CarBrand[];
    filters: CarFilters;
    priceRange: {
        min: number;
        max: number;
    };
}

// ==========================================
// Car Detail Types
// ==========================================

export interface CarDetailPageProps {
    car: Car & {
        reviews: Review[];
    };
    relatedCars: Car[];
    availableLocations: Location[];
    drivers: DriverProfile[];
}

// ==========================================
// Booking Types
// ==========================================

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

export interface BookingCheckoutPageProps {
    booking: BookingCalculation;
    car: Car;
    location: Location;
    driver?: DriverProfile;
    locations: Location[];
    drivers: DriverProfile[];
}

export interface BookingConfirmationPageProps {
    booking: Booking;
    car: Car;
    location: Location;
    driver?: DriverProfile;
    payment: {
        transaction_id: string;
        amount: number;
        method: string;
    };
}

// ==========================================
// Customer Dashboard Types
// ==========================================

export interface CustomerDashboardProps {
    user: User;
    upcomingBookings: Booking[];
    activeBookings: Booking[];
    stats: {
        totalBookings: number;
        totalSpent: number;
        pendingReviews: number;
    };
}

export interface MyBookingsPageProps {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    tab: 'upcoming' | 'active' | 'completed' | 'canceled';
}

// ==========================================
// Content Pages Types
// ==========================================

export interface LocationsPageProps {
    locations: Location[];
}

export interface AboutPageProps {
    stats: {
        yearsInBusiness: number;
        totalCars: number;
        happyCustomers: number;
        locations: number;
    };
}

export interface ContactPageProps {
    locations: Location[];
}

// ==========================================
// Utility Types
// ==========================================

export interface DateRange {
    from: Date | null;
    to: Date | null;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}
