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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all car rental bookings and reservations
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Total Bookings</CardTitle>
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Confirmed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.confirmed}</div>
                            <p className="text-xs text-muted-foreground mt-1">Ready to start</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Active Rentals</CardTitle>
                            <Car className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">Currently ongoing</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Cancelled</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.cancelled}</div>
                            <p className="text-xs text-muted-foreground mt-1">Cancelled bookings</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Bookings</CardTitle>
                        <CardDescription>
                            {bookings.total} booking{bookings.total !== 1 ? 's' : ''} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Code, customer..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>

                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="All Statuses" />
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

                            <Input
                                type="date"
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                onBlur={handleDateFilterChange}
                                className="w-full sm:w-[180px]"
                            />

                            <Input
                                type="date"
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                onBlur={handleDateFilterChange}
                                className="w-full sm:w-[180px]"
                            />
                        </div>

                        {/* Table */}
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
                                                <div className="flex items-center justify-end gap-1">
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
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(bookings.current_page - 1) * bookings.per_page + 1} to{' '}
                                    {Math.min(bookings.current_page * bookings.per_page, bookings.total)} of{' '}
                                    {bookings.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={bookings.current_page === 1}
                                        onClick={() => handlePageChange(bookings.current_page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={bookings.current_page === bookings.last_page}
                                        onClick={() => handlePageChange(bookings.current_page + 1)}
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
