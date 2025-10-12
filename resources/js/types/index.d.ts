import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

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

export interface UserVerification {
    id: number;
    user_id: number;

    // Driving license information
    driving_license_number?: string | null;
    driving_license_image?: string | null;
    license_type?: string | null;
    license_issue_date?: string | null;
    license_expiry_date?: string | null;
    license_issued_country?: string | null;

    // Identity verification
    id_image?: string | null;
    selfie_image?: string | null;
    nationality?: string | null;

    // Verification status
    status: 'pending' | 'verified' | 'rejected' | 'expired';

    // Audit fields
    verified_by?: number | null;
    verified_at?: string | null;
    rejected_by?: number | null;
    rejected_reason?: string | null;
    rejected_at?: string | null;

    // Relationships
    user?: User;
    verifier?: User;
    rejector?: User;

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
    status: 'active' | 'paused' | 'upcoming';
    is_auto_apply: boolean;
    is_featured: boolean;
    priority: number;
    created_by: number | null;
    creator?: User;
    created_at: string;
    updated_at: string;
}

