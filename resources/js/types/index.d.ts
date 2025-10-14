import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// Export driver profile types
export * from './models/driver-profile';

// Export booking types
export * from './models/booking';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: unknown;
}

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
    role: 'customer' | 'owner' | 'driver' | 'admin';
    status: 'active' | 'inactive' | 'suspended' | 'banned';

    // Status tracking (for suspended/banned accounts)
    status_note?: string | null;
    status_changed_at?: string | null;
    status_changed_by_id?: number | null;

    // Relationships
    verification?: UserVerification;
    status_changer?: Pick<User, 'id' | 'name' | 'email'>;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface UserVerification {
    id: number;
    user_id: number;

    // Driving license information
    driving_license_number?: string | null;
    license_front_image?: string | null; // Front side
    license_back_image?: string | null; // Back side
    license_type?: string | null; // B1, B2, C, D, E, etc.
    license_issue_date?: string | null;
    license_expiry_date?: string | null;
    license_issued_country?: string | null;
    driving_experience_years?: number | null; // For drivers

    // Identity verification
    id_card_front_image?: string | null; // CCCD front
    id_card_back_image?: string | null; // CCCD back
    selfie_image?: string | null;
    nationality?: string | null;

    // Verification status
    status: 'pending' | 'verified' | 'rejected' | 'expired';

    // Audit fields
    verified_by?: number | null;
    verified_at?: string | null;
    rejected_by?: number | null;
    rejected_at?: string | null;
    rejected_reason?: string | null;

    // Relationships
    user?: User;
    verifier?: Pick<User, 'id' | 'name' | 'email'>;
    rejector?: Pick<User, 'id' | 'name' | 'email'>;

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface UserStats {
    total: number;
    customers: number;
    owners: number;
    drivers: number;
    admins: number;
    verified: number;
    active: number;
}

export interface UserFilters {
    role: 'all' | 'customer' | 'owner' | 'driver' | 'admin';
    status: 'all' | 'active' | 'inactive' | 'suspended' | 'banned';
    verified: 'all' | 'yes' | 'no';
    search: string;
}

export interface Location {
    id: number;

    // Basic Information
    name: string;
    slug: string;
    description?: string | null;

    // Address Details
    address?: string | null;

    // Geographic Coordinates
    latitude?: number | null;
    longitude?: number | null;

    // Contact Information
    phone?: string | null;
    email?: string | null;

    // Operating Hours
    opening_time?: string | null; // HH:mm format
    closing_time?: string | null; // HH:mm format
    is_24_7: boolean;

    // Display & Status
    is_airport: boolean;
    is_popular: boolean;
    is_active: boolean;
    sort_order: number;

    // Computed Properties (from Model)
    operating_hours?: string; // e.g., "08:00 - 18:00" or "24/7"
    distance?: number; // Distance in km (when using nearby scope)

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface Promotion {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: string;
    max_discount: string | null;
    min_amount: string;
    min_rental_hours: number;
    max_uses: number | null;
    max_uses_per_user: number;
    used_count: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'paused' | 'upcoming' | 'archived';
    is_auto_apply: boolean;
    is_featured: boolean;
    priority: number;
    created_by: number | null;
    creator?: User;
    created_at: string;
    updated_at: string;
}

export interface CarBrand {
    id: number;
    name: string;
    slug: string;
    logo?: string | null;
    is_active: boolean;
    sort_order: number;
    cars_count?: number;
    active_cars_count?: number;
    created_at: string;
    updated_at: string;
}

export interface CarCategory {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
    cars_count?: number;
    active_cars_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Car {
    id: number;
    owner_id: number;
    category_id: number;
    brand_id: number;
    location_id: number;
    name?: string | null;
    model: string;
    color?: string | null;
    year: number;
    license_plate: string;
    vin?: string | null;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    odometer_km: number;
    insurance_expiry?: string | null;
    registration_expiry?: string | null;
    last_maintenance_date?: string | null;
    next_maintenance_km?: number | null;
    is_delivery_available: boolean;
    status: 'available' | 'rented' | 'maintenance' | 'inactive';
    is_verified: boolean;
    description?: string | null;
    features?: Record<string, boolean> | null;
    hourly_rate: string;
    daily_rate: string;
    daily_hour_threshold: number;
    deposit_amount: string;
    min_rental_hours: number;
    overtime_fee_per_hour: string;
    delivery_fee_per_km?: string | null;
    max_delivery_distance?: number | null;
    rental_count: number;
    average_rating?: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    owner?: User;
    category?: CarCategory;
    brand?: CarBrand;
    location?: Location;
    images?: CarImage[];
    primary_image?: CarImage;
}

export interface CarImage {
    id: number;
    car_id: number;
    image_path: string;
    alt_text?: string | null;
    is_primary: boolean;
    sort_order: number;
    url: string;
    created_at: string;
    updated_at: string;

    // Relationships
    car?: Car;
}
