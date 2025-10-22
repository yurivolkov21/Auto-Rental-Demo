import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';
import { Calendar, Car, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface UpcomingBooking {
    id: number;
    booking_code: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
    total_amount: string;
    car: {
        id: number;
        name: string;
        brand: string;
        category: string;
        primary_image: string;
    };
    pickup_location: {
        name: string;
    };
}

interface ActiveBooking {
    id: number;
    booking_code: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
    total_amount: string;
    car: {
        id: number;
        name: string;
        brand: string;
        category: string;
        primary_image: string;
    };
    return_location: {
        name: string;
    };
}

interface DashboardProps {
    upcomingBookings: UpcomingBooking[];
    activeBookings: ActiveBooking[];
    stats: {
        total_bookings: number;
        upcoming_bookings: number;
        active_bookings: number;
        completed_bookings: number;
        total_spent: string;
        pending_reviews: number;
    };
}

export default function CustomerDashboard({
    upcomingBookings,
    activeBookings,
    stats,
}: DashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    const statCards = [
        {
            title: 'Total Bookings',
            value: stats.total_bookings,
            icon: Car,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Upcoming',
            value: stats.upcoming_bookings,
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-600',
        },
        {
            title: 'Active Rentals',
            value: stats.active_bookings,
            icon: Calendar,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Completed',
            value: stats.completed_bookings,
            icon: CheckCircle,
            color: 'bg-gray-100 text-gray-600',
        },
    ];

    return (
        <CustomerLayout title="My Dashboard" description="Manage your bookings">
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                        <p className="text-gray-600">Welcome back! Here's what's happening with your rentals.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat) => (
                            <Card key={stat.title}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                        <div className={`p-3 rounded-lg ${stat.color}`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Total Spent Card */}
                    <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 mb-1">Total Spent</p>
                                    <p className="text-3xl font-bold">{formatCurrency(parseFloat(stats.total_spent))}</p>
                                </div>
                                <Link href="/customer/bookings">
                                    <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                                        View All Bookings
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Rentals */}
                    {activeBookings.length > 0 && (
                        <Card className="mb-8 border-green-200 bg-green-50">
                            <CardHeader className="border-b border-green-200">
                                <CardTitle className="flex items-center gap-2 text-green-900">
                                    <Car className="w-5 h-5" />
                                    Active Rentals
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {activeBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-green-200"
                                        >
                                            <img
                                                src={booking.car.primary_image}
                                                alt={booking.car.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {booking.car.brand} {booking.car.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Return by: <span className="font-medium text-gray-900">{formatDate(booking.return_datetime)}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Return to: {booking.return_location.name}
                                                </p>
                                            </div>
                                            <Link href={`/customer/bookings/${booking.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Upcoming Bookings */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Upcoming Bookings
                                </CardTitle>
                                <Link href="/customer/bookings?status=confirmed">
                                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                        View All
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {upcomingBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <img
                                                src={booking.car.primary_image}
                                                alt={booking.car.name}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">
                                                    {booking.car.brand} {booking.car.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Pickup: <span className="font-medium text-gray-900">{formatDate(booking.pickup_datetime)}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {booking.pickup_location.name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                                <p className="text-xl font-bold text-blue-600">
                                                    {formatCurrency(parseFloat(booking.total_amount))}
                                                </p>
                                            </div>
                                            <Link href={`/customer/bookings/${booking.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Upcoming Bookings
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Ready to hit the road? Browse our cars and make a reservation.
                                    </p>
                                    <Link href="/cars">
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Browse Cars
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Reviews Notice */}
                    {stats.pending_reviews > 0 && (
                        <Card className="mt-8 bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">
                                            Share Your Experience
                                        </h3>
                                        <p className="text-sm text-blue-700">
                                            You have {stats.pending_reviews} completed {stats.pending_reviews === 1 ? 'rental' : 'rentals'} waiting for your review.
                                        </p>
                                    </div>
                                    <Link href="/customer/bookings?status=completed">
                                        <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                            Write Reviews
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
