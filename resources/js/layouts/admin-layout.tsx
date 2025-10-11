import { PropsWithChildren } from 'react';
import AdminSidebarLayout from './admin/admin-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { useFlashMessages } from '@/hooks/use-flash-messages';

interface AdminLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Admin Layout Wrapper
 * Top-level layout for all admin pages with breadcrumb support
 */
export default function AdminLayout({ children, breadcrumbs = [] }: AdminLayoutProps) {
    useFlashMessages();

    return <AdminSidebarLayout breadcrumbs={breadcrumbs}>{children}</AdminSidebarLayout>;
}
