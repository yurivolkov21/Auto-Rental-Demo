import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { CustomerHeader } from '@/components/customer/layout/customer-header';
import { CustomerFooter } from '@/components/customer/layout/customer-footer';

interface CustomerLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function CustomerLayout({ children, title, description }: CustomerLayoutProps) {
    const fullTitle = title ? `${title} | AutoRental` : 'AutoRental - Premium Car Rental Service';

    return (
        <>
            <Head title={fullTitle}>
                {description && <meta name="description" content={description} />}
            </Head>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <CustomerHeader />
                <main className="flex-1">{children}</main>
                <CustomerFooter />
            </div>
        </>
    );
}
