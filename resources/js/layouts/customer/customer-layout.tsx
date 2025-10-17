import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { CustomerHeader } from '@/components/customer/layout/customer-header';
import { CustomerFooter } from '@/components/customer/layout/customer-footer';

interface CustomerLayoutProps {
    title?: string;
    description?: string;
}

/**
 * Main layout for customer-facing pages
 * Clean, professional design with sticky header and comprehensive footer
 */
export function CustomerLayout({
    children,
    title,
    description,
}: PropsWithChildren<CustomerLayoutProps>) {
    const fullTitle = title ? `${title} | AutoRental` : 'AutoRental - Premium Car Rental Service';
    const defaultDescription =
        'Rent premium cars in Vietnam. Wide selection of vehicles, competitive prices, and excellent service. Book your car today!';

    return (
        <>
            <Head>
                <title>{fullTitle}</title>
                <meta name="description" content={description || defaultDescription} />
                <meta property="og:title" content={fullTitle} />
                <meta property="og:description" content={description || defaultDescription} />
            </Head>

            <div className="min-h-screen flex flex-col bg-gray-50">
                <CustomerHeader />

                <main className="flex-1">{children}</main>

                <CustomerFooter />
            </div>
        </>
    );
}
