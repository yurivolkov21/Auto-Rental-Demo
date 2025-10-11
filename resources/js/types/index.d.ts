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
