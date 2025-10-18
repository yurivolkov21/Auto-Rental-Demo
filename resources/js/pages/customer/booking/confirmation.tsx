import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currency';

interface Car {
    id: number;
    name: string;
    model: string;
    brand: { id: number; name: string };
    category: { id: number; name: string };
    primary_image: string;
    seats: number;
    transmission: string;
    fuel_type: string;
}

interface Location {
    id: number;
    name: string;
    address: string;
}

interface Booking {
    id: number;
    reference_number: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
    total_amount: string;
    payment_method: string;
    with_insurance: boolean;
    special_requests?: string;
    car: Car;
    pickup_location: Location;
    return_location: Location;
    driver?: {
        id: number;
        name: string;
        phone: string;
    };
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    charges: Array<{
        type: string;
        amount: string;
        description: string;
    }>;
}

interface ConfirmationProps {
    booking: Booking;
}

/**
 * Booking Confirmation Page
 * Displays successful booking confirmation with all details
 */
export default function BookingConfirmation({ booking }: ConfirmationProps) {
    const handleDownloadReceipt = () => {
        window.print();
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <CustomerLayout
            title="Booking Confirmed"
            description={`Booking #${booking.reference_number}`}
        >
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-16 w-16 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Booking Confirmed!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Your booking reference: <strong>{booking.reference_number}</strong>
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            A confirmation email has been sent to{' '}
                            <strong>{booking.customer.email}</strong>
                        </p>
                    </div>

                    {/* Booking Status */}
                    <div className="text-center mb-8">
                        <span
                            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(
                                booking.status
                            )}`}
                        >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                    </div>

                    {/* Car & Dates Card */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">Rental Details</h2>

                            <div className="flex gap-4 mb-6 pb-6 border-b">
                                <img
                                    src={booking.car.primary_image}
                                    alt={booking.car.name}
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {booking.car.brand.name} {booking.car.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {booking.car.category.name}
                                    </p>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <span>{booking.car.seats} seats</span>
                                        <span>{booking.car.transmission}</span>
                                        <span>{booking.car.fuel_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Pickup & Return */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        Pickup Details
                                    </h4>
                                    <div className="text-sm space-y-1">
                                        <p className="text-gray-600">
                                            {new Date(booking.pickup_datetime).toLocaleDateString(
                                                'en-US',
                                                {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(booking.pickup_datetime).toLocaleTimeString(
                                                'en-US',
                                                {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                }
                                            )}
                                        </p>
                                        <p className="text-gray-600 mt-2">
                                            {booking.pickup_location.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {booking.pickup_location.address}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        Return Details
                                    </h4>
                                    <div className="text-sm space-y-1">
                                        <p className="text-gray-600">
                                            {new Date(booking.return_datetime).toLocaleDateString(
                                                'en-US',
                                                {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                }
                                            )}
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(booking.return_datetime).toLocaleTimeString(
                                                'en-US',
                                                {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                }
                                            )}
                                        </p>
                                        <p className="text-gray-600 mt-2">
                                            {booking.return_location.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {booking.return_location.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Services */}
                    {(booking.driver || booking.with_insurance) && (
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-4">Additional Services</h2>
                                <div className="space-y-3">
                                    {booking.driver && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Driver Service
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {booking.driver.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Contact: {booking.driver.phone}
                                                </p>
                                            </div>
                                            <span className="text-green-600 font-medium">
                                                Included
                                            </span>
                                        </div>
                                    )}
                                    {booking.with_insurance && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Insurance Coverage
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Full collision and theft protection
                                                </p>
                                            </div>
                                            <span className="text-green-600 font-medium">
                                                Included
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Summary */}
                    <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-6 text-gray-900">Payment Summary</h2>

                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                                {booking.charges.map((charge, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {charge.description || charge.type}
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(parseFloat(charge.amount))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-6 pt-2">
                                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                    {formatCurrency(parseFloat(booking.total_amount))}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                                <p className="flex items-center justify-between">
                                    <span>Payment Method:</span>
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {booking.payment_method.replace('_', ' ')}
                                    </span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium">{booking.customer.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{booking.customer.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium">{booking.customer.phone}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Special Requests */}
                    {booking.special_requests && (
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-4">Special Requests</h2>
                                <p className="text-sm text-gray-600">{booking.special_requests}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Important Information */}
                    <Card className="mb-8 bg-blue-50 border-blue-200">
                        <CardContent className="pt-6">
                            <h3 className="font-semibold text-blue-900 mb-3">
                                Important Pickup Instructions
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• Please arrive 15 minutes before your pickup time</li>
                                <li>
                                    • Bring a valid driver's license and credit card for security
                                    deposit
                                </li>
                                <li>• Vehicle inspection will be conducted before departure</li>
                                <li>
                                    • Contact us at support@autorental.com for any questions
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleDownloadReceipt}
                            variant="outline"
                            className="flex-1 sm:flex-none"
                        >
                            Download Receipt
                        </Button>
                        <Link href="/dashboard/bookings">
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                View My Bookings
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
