import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { DriverProfileWithRelations } from '@/types/models/driver-profile';
import { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Star, Banknote, TrendingUp, Users, Clock, UserCheck, UserX, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Driver Profiles', href: '/admin/driver-profiles' },
];

interface Props {
    drivers: {
        data: DriverProfileWithRelations[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: {
        total: number;
        available: number;
        on_duty: number;
        suspended: number;
    };
    filters: {
        search?: string;
        status?: string;
        sort?: string;
        order?: string;
    };
}

const STATUS_CONFIG = {
    available: { label: 'Available', class: 'bg-green-100 text-green-800 border-green-200' },
    on_duty: { label: 'On Duty', class: 'bg-blue-100 text-blue-800 border-blue-200' },
    off_duty: { label: 'Off Duty', class: 'bg-gray-100 text-gray-800 border-gray-200' },
    suspended: { label: 'Suspended', class: 'bg-red-100 text-red-800 border-red-200' },
};

export default function Index({ drivers, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/driver-profiles', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get('/admin/driver-profiles', {
            search: search || undefined,
            status: value !== 'all' ? value : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(numAmount);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Driver Profiles" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Driver Profiles</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage driver profiles, pricing, and availability
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Total Drivers</CardTitle>
                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Platform-managed drivers</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Available</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.available}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}% ready for booking
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">On Duty</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.on_duty}</div>
                            <p className="text-xs text-muted-foreground mt-1">Currently working</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Suspended</CardTitle>
                            <UserX className="h-4 w-4 text-red-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.suspended}</div>
                            <p className="text-xs text-muted-foreground mt-1">Temporarily inactive</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Drivers</CardTitle>
                        <CardDescription>View and manage driver profiles and pricing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="on_duty">On Duty</SelectItem>
                                    <SelectItem value="off_duty">Off Duty</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Hourly Fee</TableHead>
                                        <TableHead>Daily Fee</TableHead>
                                        <TableHead>Trips</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No drivers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        drivers.data.map((driver) => (
                                            <TableRow key={driver.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{driver.user.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {driver.user.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={STATUS_CONFIG[driver.status].class}>
                                                        {STATUS_CONFIG[driver.status].label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Banknote className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{formatCurrency(driver.hourly_fee)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Banknote className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{formatCurrency(driver.daily_fee)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                        <span className="font-medium">{driver.completed_trips}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {driver.average_rating ? (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            <span className="font-medium">
                                                                {parseFloat(driver.average_rating).toFixed(1)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/driver-profiles/${driver.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/driver-profiles/${driver.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {drivers.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(drivers.current_page - 1) * drivers.per_page + 1} to{' '}
                                    {Math.min(drivers.current_page * drivers.per_page, drivers.total)} of{' '}
                                    {drivers.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={drivers.current_page === 1}
                                        onClick={() =>
                                            router.get(`/admin/driver-profiles?page=${drivers.current_page - 1}`, {
                                                search: search || undefined,
                                                status: status !== 'all' ? status : undefined,
                                            })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={drivers.current_page === drivers.last_page}
                                        onClick={() =>
                                            router.get(`/admin/driver-profiles?page=${drivers.current_page + 1}`, {
                                                search: search || undefined,
                                                status: status !== 'all' ? status : undefined,
                                            })
                                        }
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
