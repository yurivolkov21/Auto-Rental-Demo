import { useState } from 'react';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingCard } from '@/components/customer/booking/booking-card';
import { Search, Filter } from 'lucide-react';

interface Booking {
    id: number;
    booking_code: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
    payment_status: string;
    pickup_datetime: string;
    return_datetime: string;
    total_amount: string;
    with_driver: boolean;
    is_delivery: boolean;
    can_cancel: boolean;
    car: {
        id: number;
        name: string;
        model: string;
        brand: { id: number; name: string };
        category: { id: number; name: string };
        primary_image: string;
        seats: number;
        transmission: string;
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
}

interface BookingsIndexProps {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    stats: {
        total: number;
        upcoming: number;
        active: number;
        completed: number;
    };
    filters: {
        status: string;
        search: string;
    };
}

export default function BookingsIndex({ bookings, stats, filters }: BookingsIndexProps) {
    const [search, setSearch] = useState(filters.search);
    const [selectedStatus, setSelectedStatus] = useState(filters.status);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/customer/bookings',
            { status: selectedStatus, search },
            { preserveState: true }
        );
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        router.get(
            '/customer/bookings',
            { status, search },
            { preserveState: true }
        );
    };

    const statusTabs = [
        { value: 'all', label: 'All', count: stats.total },
        { value: 'pending', label: 'Pending', count: stats.upcoming },
        { value: 'confirmed', label: 'Confirmed', count: stats.upcoming },
        { value: 'active', label: 'Active', count: stats.active },
        { value: 'completed', label: 'Completed', count: stats.completed },
        { value: 'cancelled', label: 'Cancelled', count: 0 },
    ];

    return (
        <CustomerLayout title="My Bookings" description="View and manage your car rental bookings">
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
                        <p className="text-gray-600">
                            View and manage all your rental bookings in one place.
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.upcoming}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-1">Active</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-gray-600 mb-1">Completed</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            {/* Status Tabs */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {statusTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleStatusChange(tab.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedStatus === tab.value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by booking code or car name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="outline" className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Search
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Bookings List */}
                    {bookings.data.length > 0 ? (
                        <div className="space-y-6">
                            {bookings.data.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}

                            {/* Pagination */}
                            {bookings.last_page > 1 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {bookings.links.map((link, index) => {
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-4 py-2 text-gray-400 cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        preserveState
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Bookings Found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {search || selectedStatus !== 'all'
                                        ? "Try adjusting your filters to find what you're looking for."
                                        : "You haven't made any bookings yet. Start exploring our cars!"}
                                </p>
                                <Link href="/cars">
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Browse Cars
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
