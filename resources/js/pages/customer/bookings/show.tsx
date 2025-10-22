import { useState } from 'react';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from '@/components/customer/booking/booking-status-badge';
import { CancelBookingDialog } from '@/components/customer/booking/cancel-booking-dialog';
import { formatCurrency } from '@/lib/currency';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    CreditCard,
    FileText,
    XCircle,
    Download,
    AlertCircle
} from 'lucide-react';

interface BookingShowProps {
    booking: {
        id: number;
        booking_code: string;
        status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
        payment_status: string;
        payment_method: string;
        pickup_datetime: string;
        return_datetime: string;
        actual_pickup_time: string | null;
        actual_return_time: string | null;
        total_amount: string;
        deposit_amount: string;
        with_driver: boolean;
        is_delivery: boolean;
        delivery_address: string | null;
        special_requests: string | null;
        cancellation_reason: string | null;
        confirmed_at: string | null;
        cancelled_at: string | null;
        can_cancel: boolean;
        created_at: string;
        car: {
            id: number;
            name: string;
            model: string;
            brand: { id: number; name: string };
            category: { id: number; name: string };
            primary_image: string;
            seats: number;
            transmission: string;
            fuel_type: string;
        };
        pickup_location: {
            id: number;
            name: string;
            address: string;
        };
        return_location: {
            id: number;
            name: string;
            address: string;
        };
        driver: {
            id: number;
            name: string;
            phone: string;
            average_rating: number;
        } | null;
        customer: {
            name: string;
            email: string;
            phone: string;
        };
        charges: Array<{
            id: number;
            type: string;
            description: string;
            amount: string;
        }>;
        promotions: Array<{
            id: number;
            code: string;
            discount_amount: string;
        }>;
    };
}

export default function BookingShow({ booking }: BookingShowProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const getPaymentStatusBadge = (status: string) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    return (
        <CustomerLayout
            title={`Booking ${booking.booking_code}`}
            description="View booking details"
        >
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    {/* Back Button */}
                    <Link
                        href="/customer/bookings"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Bookings
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Booking Details
                            </h1>
                            <p className="text-gray-600">
                                Reference: <span className="font-medium text-gray-900">{booking.booking_code}</span>
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <BookingStatusBadge status={booking.status} className="text-sm" />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusBadge(booking.payment_status)}`}>
                                {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {booking.can_cancel && (
                        <Card className="mb-6 border-orange-200 bg-orange-50">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-orange-900 mb-1">
                                                Need to cancel?
                                            </h3>
                                            <p className="text-sm text-orange-700">
                                                You can cancel this booking. Cancellation policy applies.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowCancelDialog(true)}
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel Booking
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Cancellation Notice */}
                    {booking.status === 'cancelled' && booking.cancellation_reason && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-red-900 mb-1">
                                            Booking Cancelled
                                        </h3>
                                        <p className="text-sm text-red-700 mb-2">
                                            Cancelled on: {booking.cancelled_at ? formatDate(booking.cancelled_at) : 'N/A'}
                                        </p>
                                        <p className="text-sm text-red-800">
                                            <strong>Reason:</strong> {booking.cancellation_reason}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Car & Rental Details */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Rental Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Car Image */}
                                <div className="md:w-64 h-48 overflow-hidden rounded-lg">
                                    <img
                                        src={booking.car.primary_image}
                                        alt={booking.car.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Car Info */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {booking.car.brand.name} {booking.car.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{booking.car.category.name}</p>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Seats</p>
                                            <p className="font-medium text-gray-900">{booking.car.seats}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Transmission</p>
                                            <p className="font-medium text-gray-900">{booking.car.transmission}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Fuel</p>
                                            <p className="font-medium text-gray-900">{booking.car.fuel_type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pickup & Return */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="w-5 h-5" />
                                    Pickup Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDate(booking.pickup_datetime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </p>
                                    <p className="font-medium text-gray-900">{booking.pickup_location.name}</p>
                                    <p className="text-sm text-gray-600">{booking.pickup_location.address}</p>
                                </div>
                                {booking.actual_pickup_time && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Actual Pickup</p>
                                        <p className="font-medium text-green-600">
                                            {formatDate(booking.actual_pickup_time)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="w-5 h-5" />
                                    Return Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDate(booking.return_datetime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Location
                                    </p>
                                    <p className="font-medium text-gray-900">{booking.return_location.name}</p>
                                    <p className="text-sm text-gray-600">{booking.return_location.address}</p>
                                </div>
                                {booking.actual_return_time && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Actual Return</p>
                                        <p className="font-medium text-green-600">
                                            {formatDate(booking.actual_return_time)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Services */}
                    {(booking.driver || booking.is_delivery) && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Additional Services</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {booking.driver && (
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <User className="w-5 h-5 text-gray-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                Driver Service
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {booking.driver.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Contact: {booking.driver.phone} • Rating: {booking.driver.average_rating}/5
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {booking.is_delivery && booking.delivery_address && (
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                        <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                Delivery Service
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {booking.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Summary */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mb-6">
                                {booking.charges.map((charge) => (
                                    <div key={charge.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{charge.description}</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(parseFloat(charge.amount))}
                                        </span>
                                    </div>
                                ))}
                                {booking.promotions.map((promo) => (
                                    <div key={promo.id} className="flex justify-between text-sm text-green-600">
                                        <span>Discount ({promo.code})</span>
                                        <span className="font-semibold">
                                            -{formatCurrency(parseFloat(promo.discount_amount))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                        {formatCurrency(parseFloat(booking.total_amount))}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between mb-1">
                                        <span>Payment Method:</span>
                                        <span className="font-medium text-gray-900 capitalize">
                                            {booking.payment_method?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Deposit:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(parseFloat(booking.deposit_amount))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Receipt
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Special Requests */}
                    {booking.special_requests && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Special Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700">{booking.special_requests}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Name:</span>
                                    <span className="font-medium text-gray-900">{booking.customer.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium text-gray-900">{booking.customer.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="font-medium text-gray-900">{booking.customer.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Booked on:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatDate(booking.created_at)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Dialog */}
            <CancelBookingDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                bookingId={booking.id}
                bookingCode={booking.booking_code}
                pickupDatetime={booking.pickup_datetime}
            />
        </CustomerLayout>
    );
}
