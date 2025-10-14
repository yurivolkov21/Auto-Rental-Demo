import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Car,
    CheckCircle,
    Clock,
    Eye,
    Search,
    User,
    XCircle,
    AlertTriangle,
    Edit,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Bookings', href: '/admin/bookings' },
];

interface Booking {
    id: number;
    booking_code: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    car: {
        id: number;
        model: string;
        license_plate: string;
        brand: {
            name: string;
        };
    };
    charge: {
        total_amount: string;
        amount_paid: string;
        balance_due: string;
    };
    with_driver: boolean;
    is_delivery: boolean;
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    confirmed: number;
    active: number;
    completed: number;
    cancelled: number;
    rejected: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Booking[];
}

interface Filters {
    status: string;
    owner_id: string | null;
    start_date: string | null;
    end_date: string | null;
    search: string;
}

export default function AdminBookingsIndex({
    bookings,
    stats,
    filters,
}: {
    bookings: Pagination;
    stats: Stats;
    filters: Filters;
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/bookings',
            {
                status,
                start_date: startDate,
                end_date: endDate,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleDateFilterChange = () => {
        router.get(
            '/admin/bookings',
            {
                status: statusFilter,
                start_date: startDate,
                end_date: endDate,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/bookings',
            {
                status: statusFilter,
                start_date: startDate,
                end_date: endDate,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
            active: { color: 'bg-green-100 text-green-800 border-green-200', icon: Car },
            completed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
            rejected: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={config.color}>
                <Icon className="mr-1 h-3 w-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/bookings',
            {
                page,
                status: statusFilter,
                start_date: startDate,
                end_date: endDate,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Booking Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                        <p className="text-muted-foreground">
                            Manage all car rental bookings and reservations
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">All time bookings</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
                            <Car className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.active + stats.confirmed}
                            </div>
                            <p className="text-xs text-muted-foreground">Currently ongoing</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Bookings</CardTitle>
                        <CardDescription>Search and filter by status, dates, or booking code</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onBlur={handleDateFilterChange}
                                />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onBlur={handleDateFilterChange}
                                />
                            </div>

                            {/* Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Code, customer..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" size="icon" variant="secondary">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Bookings</CardTitle>
                                <CardDescription>
                                    {bookings.total} booking{bookings.total !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking Code</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Car</TableHead>
                                    <TableHead>Pickup Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.data.map((booking) => (
                                        <TableRow key={booking.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {booking.booking_code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{booking.user.name}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {booking.user.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {booking.car.brand.name} {booking.car.model}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {booking.car.license_plate}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {formatDate(booking.pickup_datetime)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        to {formatDate(booking.return_datetime)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {booking.with_driver && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <User className="mr-1 h-3 w-3" />
                                                            Driver
                                                        </Badge>
                                                    )}
                                                    {booking.is_delivery && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Car className="mr-1 h-3 w-3" />
                                                            Delivery
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(booking.charge.total_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/admin/bookings/${booking.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {booking.status === 'pending' && (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/bookings/${booking.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {bookings.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {bookings.data.length} of {bookings.total} bookings
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(bookings.current_page - 1)}
                                        disabled={bookings.current_page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: bookings.last_page }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === bookings.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className="w-9"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(bookings.current_page + 1)}
                                        disabled={bookings.current_page === bookings.last_page}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
