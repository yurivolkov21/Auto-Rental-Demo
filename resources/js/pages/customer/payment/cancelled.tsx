import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { Ban, Home, ArrowRight } from 'lucide-react';

interface PaymentCancelledProps {
    message?: string;
    booking?: {
        id: number;
        booking_code: string;
        car_name: string;
        total_amount: string;
    };
}

export default function PaymentCancelled({ message, booking }: PaymentCancelledProps) {
    return (
        <CustomerLayout title="Payment Cancelled" description="Payment was cancelled">
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
                    <Card className="border-orange-200">
                        <CardContent className="pt-12 pb-12 text-center">
                            {/* Cancel Icon */}
                            <div className="mb-6">
                                <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Ban className="w-12 h-12 text-orange-600" />
                                </div>
                            </div>

                            {/* Cancel Message */}
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                Payment Cancelled
                            </h1>
                            <p className="text-lg text-gray-600 mb-8">
                                {message || 'You cancelled the payment process.'}
                            </p>

                            {/* Booking Info */}
                            {booking && (
                                <div className="mb-8">
                                    <div className="p-6 bg-white border rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Your Booking
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Booking Code:</span>
                                                <span className="font-medium text-gray-900">
                                                    {booking.booking_code}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Car:</span>
                                                <span className="font-medium text-gray-900">
                                                    {booking.car_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(parseFloat(booking.total_amount))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-4">
                                        Your booking is still saved. You can complete the payment anytime from your bookings page.
                                    </p>
                                </div>
                            )}

                            {/* What's Next */}
                            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
                                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                    <li>Your booking is saved with "Pending Payment" status</li>
                                    <li>You can complete payment from your bookings page</li>
                                    <li>The car will be held for you for 24 hours</li>
                                    <li>Contact support if you need assistance</li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {booking ? (
                                    <>
                                        <Link href={`/customer/bookings/${booking.id}`}>
                                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                                                Complete Payment
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link href="/customer/bookings">
                                            <Button variant="outline" className="w-full sm:w-auto">
                                                My Bookings
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/cars">
                                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                                Browse Cars Again
                                            </Button>
                                        </Link>
                                        <Link href="/">
                                            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
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
