import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';

interface PaymentErrorProps {
    message: string;
    error_details?: string | null;
    booking?: {
        id: number;
        booking_code: string;
    };
}

export default function PaymentError({ message, error_details, booking }: PaymentErrorProps) {
    return (
        <CustomerLayout title="Payment Error" description="Payment processing failed">
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
                    <Card className="border-red-200">
                        <CardContent className="pt-12 pb-12 text-center">
                            {/* Error Icon */}
                            <div className="mb-6">
                                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-red-600" />
                                </div>
                            </div>

                            {/* Error Message */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                Payment Failed
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                {message}
                            </p>

                            {/* Error Details (Debug) */}
                            {error_details && (
                                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                                    <p className="text-sm text-red-800 font-mono">
                                        {error_details}
                                    </p>
                                </div>
                            )}

                            {/* Booking Info */}
                            {booking && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {booking.booking_code}
                                    </p>
                                </div>
                            )}

                            {/* Support Notice */}
                            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Need Help?</strong> Contact our support team at{' '}
                                    <a href="mailto:support@autorental.com" className="underline">
                                        support@autorental.com
                                    </a>{' '}
                                    or call <a href="tel:1900-xxxx" className="underline">1900-XXXX</a>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {booking ? (
                                    <>
                                        <Link href={`/customer/bookings/${booking.id}`}>
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                View Booking Details
                                            </Button>
                                        </Link>
                                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4" />
                                            Try Payment Again
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/cars">
                                            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                                                Browse Cars
                                            </Button>
                                        </Link>
                                        <Link href="/">
                                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                                <Home className="w-4 h-4" />
                                                Go Home
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
