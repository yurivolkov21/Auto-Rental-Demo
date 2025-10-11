import { PropsWithChildren } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar, AdminContent } from '@/components/admin';

/**
 * Admin Sidebar Layout
 * Provides sidebar navigation structure for admin pages
 */
export default function AdminSidebarLayout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <AdminContent>{children}</AdminContent>
        </SidebarProvider>
    );
}
