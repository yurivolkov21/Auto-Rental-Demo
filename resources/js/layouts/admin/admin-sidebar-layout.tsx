import { PropsWithChildren } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar, AdminContent } from '@/components/admin';
import { type BreadcrumbItem } from '@/types';

interface AdminSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Admin Sidebar Layout
 * Provides sidebar navigation structure for admin pages with collapsible sidebar
 */
export default function AdminSidebarLayout({
    children,
    breadcrumbs = []
}: AdminSidebarLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <AdminContent breadcrumbs={breadcrumbs}>{children}</AdminContent>
        </SidebarProvider>
    );
}
