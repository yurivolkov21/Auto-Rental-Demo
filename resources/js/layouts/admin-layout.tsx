import { PropsWithChildren } from 'react';
import AdminSidebarLayout from './admin/admin-sidebar-layout';

/**
 * Admin Layout Wrapper
 * Top-level layout for all admin pages
 */
export default function AdminLayout({ children }: PropsWithChildren) {
    return <AdminSidebarLayout>{children}</AdminSidebarLayout>;
}
