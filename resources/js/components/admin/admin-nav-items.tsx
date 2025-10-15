import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    Calendar,
    Car,
    UserCheck,
    MapPin,
    Tag,
    BadgeCheck,
    Shapes,
    CreditCard,
} from 'lucide-react';

export interface AdminNavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    isActive?: boolean;
}

/**
 * Admin Navigation Items Configuration
 */
export const getAdminNavItems = (currentPath: string, pendingBookingsCount?: number): AdminNavItem[] => {
    return [
        {
            title: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard,
            isActive: currentPath === '/admin',
        },
        {
            title: 'Users',
            href: '/admin/users',
            icon: Users,
            isActive: currentPath.startsWith('/admin/users'),
        },
        {
            title: 'Verifications',
            href: '/admin/verifications',
            icon: ShieldCheck,
            isActive: currentPath.startsWith('/admin/verifications'),
        },
        {
            title: 'Cars',
            href: '/admin/cars',
            icon: Car,
            isActive: currentPath.startsWith('/admin/cars'),
        },
        {
            title: 'Car Brands',
            href: '/admin/car-brands',
            icon: BadgeCheck,
            isActive: currentPath.startsWith('/admin/car-brands'),
        },
        {
            title: 'Car Categories',
            href: '/admin/car-categories',
            icon: Shapes,
            isActive: currentPath.startsWith('/admin/car-categories'),
        },
        {
            title: 'Bookings',
            href: '/admin/bookings',
            icon: Calendar,
            badge: pendingBookingsCount && pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
            isActive: currentPath.startsWith('/admin/bookings'),
        },
        {
            title: 'Payments',
            href: '/admin/payments',
            icon: CreditCard,
            isActive: currentPath.startsWith('/admin/payments'),
        },
        {
            title: 'Driver Profiles',
            href: '/admin/driver-profiles',
            icon: UserCheck,
            isActive: currentPath.startsWith('/admin/driver-profiles'),
        },
        {
            title: 'Locations',
            href: '/admin/locations',
            icon: MapPin,
            isActive: currentPath.startsWith('/admin/locations'),
        },
        {
            title: 'Promotions',
            href: '/admin/promotions',
            icon: Tag,
            isActive: currentPath.startsWith('/admin/promotions'),
        },
    ];
};
