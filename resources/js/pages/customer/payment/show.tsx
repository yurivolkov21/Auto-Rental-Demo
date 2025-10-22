import { Head, Link } from '@inertiajs/react';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { ArrowLeft, CheckCircle, Clock, XCircle, RefreshCw, Receipt, Calendar, CreditCard, ArrowRightLeft } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Car {
    id: number;
    name: string;
    brand: { name: string };
    category: { name: string };
}

interface Location {
    id: number;
    name: string;
    address: string;
}

interface Booking {
    id: number;
    booking_code: string;
    car: Car;
    pickup_datetime: string;
    return_datetime: string;
    pickup_location: Location;
    return_location: Location;
    total_amount: string;
    status: string;
}

interface Payment {
    id: number;
    transaction_id: string;
    booking_id: number;
    user_id: number;
    payment_method: string;
    payment_type: string;
    amount_vnd: string;
    amount_usd: string | null;
    exchange_rate: string | null;
    currency: string;
    status: string;
    paypal_order_id: string | null;
    paypal_payer_id: string | null;
    paypal_payer_email: string | null;
    notes: string | null;
    paid_at: string | null;
    refunded_at: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    booking: Booking;
}

interface Props {
    payment: Payment;
}

export default function PaymentShow({ payment }: Props) {
    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { icon: CheckCircle, text: 'Completed', class: 'bg-green-100 text-green-800 border-green-200' },
            pending: { icon: Clock, text: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
            failed: { icon: XCircle, text: 'Failed', class: 'bg-red-100 text-red-800 border-red-200' },
            refunded: { icon: RefreshCw, text: 'Refunded', class: 'bg-purple-100 text-purple-800 border-purple-200' },
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${badge.class}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    const getPaymentMethodBadge = (method: string) => {
        const badges = {
            paypal: { icon: CreditCard, text: 'PayPal', class: 'bg-blue-50 text-blue-700 border-blue-200' },
            credit_card: { icon: CreditCard, text: 'Credit Card', class: 'bg-purple-50 text-purple-700 border-purple-200' },
            bank_transfer: { icon: Receipt, text: 'Bank Transfer', class: 'bg-gray-50 text-gray-700 border-gray-200' },
        };

        const badge = badges[method as keyof typeof badges] || badges.credit_card;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${badge.class}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <CustomerLayout>
            <Head title={`Payment Details - ${payment.transaction_id}`} />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Button */}
                <Link href="/customer/bookings">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bookings
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Details</h1>
                            <p className="text-gray-600">Transaction ID: {payment.transaction_id}</p>
                        </div>
                        {getStatusBadge(payment.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2 columns */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                        {getPaymentMethodBadge(payment.payment_method)}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Payment Type</p>
                                        <p className="font-medium capitalize">{payment.payment_type.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Amount (VND)</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {formatCurrency(parseFloat(payment.amount_vnd))}
                                        </p>
                                    </div>
                                    {payment.amount_usd && (
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Amount (USD)</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ${parseFloat(payment.amount_usd).toFixed(2)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {payment.exchange_rate && payment.amount_usd && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                            <p className="text-sm font-medium text-blue-900">Currency Conversion</p>
                                        </div>
                                        <p className="text-sm text-blue-700">
                                            Exchange Rate: 1 USD = {parseFloat(payment.exchange_rate).toLocaleString()} VND
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Rate applied at payment time
                                        </p>
                                    </div>
                                )}

                                {payment.notes && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                                        <p className="text-gray-700">{payment.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* PayPal Details */}
                        {payment.payment_method === 'paypal' && (payment.paypal_order_id || payment.paypal_payer_email) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        PayPal Transaction Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {payment.paypal_order_id && (
                                        <div>
                                            <p className="text-sm text-gray-500">PayPal Order ID</p>
                                            <p className="font-mono text-sm text-gray-900">{payment.paypal_order_id}</p>
                                        </div>
                                    )}
                                    {payment.paypal_payer_id && (
                                        <div>
                                            <p className="text-sm text-gray-500">Payer ID</p>
                                            <p className="font-mono text-sm text-gray-900">{payment.paypal_payer_id}</p>
                                        </div>
                                    )}
                                    {payment.paypal_payer_email && (
                                        <div>
                                            <p className="text-sm text-gray-500">Payer Email</p>
                                            <p className="text-gray-900">{payment.paypal_payer_email}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Associated Booking */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Booking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                                        <p className="font-bold text-lg text-gray-900">{payment.booking.booking_code}</p>
                                    </div>
                                    <Link href={`/customer/bookings/${payment.booking.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Booking
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Vehicle</p>
                                    <p className="font-medium text-gray-900">
                                        {payment.booking.car.brand.name} {payment.booking.car.name}
                                    </p>
                                    <p className="text-sm text-gray-600">{payment.booking.car.category.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Pickup</p>
                                        <p className="text-sm font-medium">{formatDate(payment.booking.pickup_datetime)}</p>
                                        <p className="text-xs text-gray-600">{payment.booking.pickup_location.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Return</p>
                                        <p className="text-sm font-medium">{formatDate(payment.booking.return_datetime)}</p>
                                        <p className="text-xs text-gray-600">{payment.booking.return_location.name}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="space-y-6">
                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Created</p>
                                    <p className="text-sm font-medium">{formatDate(payment.created_at)}</p>
                                </div>
                                {payment.paid_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Paid</p>
                                        <p className="text-sm font-medium text-green-600">{formatDate(payment.paid_at)}</p>
                                    </div>
                                )}
                                {payment.refunded_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Refunded</p>
                                        <p className="text-sm font-medium text-purple-600">{formatDate(payment.refunded_at)}</p>
                                    </div>
                                )}
                                {payment.updated_at !== payment.created_at && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                                        <p className="text-sm font-medium">{formatDate(payment.updated_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Customer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium text-gray-900">{payment.user.name}</p>
                                <p className="text-sm text-gray-600">{payment.user.email}</p>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {payment.status === 'failed' && (
                            <Card className="bg-red-50 border-red-200">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-red-800 mb-4">
                                        This payment has failed. You can retry the payment from your booking page.
                                    </p>
                                    <Link href={`/customer/bookings/${payment.booking.id}`}>
                                        <Button className="w-full" variant="destructive">
                                            Retry Payment
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {payment.status === 'completed' && (
                            <Card className="bg-green-50 border-green-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-green-800 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        <p className="font-medium">Payment Successful</p>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        Your payment has been processed successfully. A confirmation email has been sent to {payment.user.email}.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
