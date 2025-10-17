import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';
import CustomerHeader from '@/components/customer/layout/customer-header';
import CustomerFooter from '@/components/customer/layout/customer-footer';
import type { User } from '@/types';

interface CustomerLayoutProps {
    children: ReactNode;
    title?: string;
    user?: User | null;
}

export default function CustomerLayout({ children, title, user }: CustomerLayoutProps) {
    return (
        <>
            <Head title={title || 'AutoRental - Premium Car Rental Service'} />
            <div className="min-h-screen flex flex-col">
                <CustomerHeader user={user} />
                <main className="flex-1">{children}</main>
                <CustomerFooter />
            </div>
        </>
    );
}
