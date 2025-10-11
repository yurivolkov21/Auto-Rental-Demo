import { PropsWithChildren } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebarHeader } from './admin-sidebar-header';
import { type BreadcrumbItem } from '@/types';

interface AdminContentProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

/**
 * Admin Content Component
 * Wrapper for main admin content area with header, sidebar toggle, and breadcrumbs
 * Matches the design of the main app content
 */
export default function AdminContent({ children, breadcrumbs = [] }: AdminContentProps) {
    return (
        <SidebarInset className="overflow-x-hidden">
            <AdminSidebarHeader breadcrumbs={breadcrumbs} />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                {children}
            </div>
        </SidebarInset>
    );
}
