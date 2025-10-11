import { PropsWithChildren } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';

/**
 * Admin Content Component
 * Wrapper for main admin content area with consistent padding
 */
export default function AdminContent({ children }: PropsWithChildren) {
    return (
        <SidebarInset>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {children}
            </div>
        </SidebarInset>
    );
}
