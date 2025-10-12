import {
    LayoutDashboard,
    ShieldCheck,
    Users,
    Calendar,
    Car,
    UserCheck,
    MapPin,
    Tag,
    Settings,
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
export const getAdminNavItems = (currentPath: string): AdminNavItem[] => {
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
            title: 'Bookings',
            href: '/admin/bookings',
            icon: Calendar,
            isActive: currentPath.startsWith('/admin/bookings'),
        },
        {
            title: 'Drivers',
            href: '/admin/drivers',
            icon: UserCheck,
            isActive: currentPath.startsWith('/admin/drivers'),
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
        {
            title: 'Settings',
            href: '/admin/settings',
            icon: Settings,
            isActive: currentPath.startsWith('/admin/settings'),
        },
    ];
};
