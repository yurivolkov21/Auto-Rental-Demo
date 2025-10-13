import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { DriverProfileWithRelations } from '@/types/models/driver-profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Star, MapPin, DollarSign, TrendingUp, Users, Clock, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

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
    available: { label: 'Available', class: 'bg-green-100 text-green-800' },
    on_duty: { label: 'On Duty', class: 'bg-blue-100 text-blue-800' },
    off_duty: { label: 'Off Duty', class: 'bg-gray-100 text-gray-800' },
    suspended: { label: 'Suspended', class: 'bg-red-100 text-red-800' },
};

export default function Index({ drivers, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get('/admin/driver-profiles', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (sortBy: string) => {
        const newOrder = filters.sort === sortBy && filters.order === 'asc' ? 'desc' : 'asc';
        router.get('/admin/driver-profiles', {
            ...filters,
            sort: sortBy,
            order: newOrder,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(numAmount);
    };

    return (
        <AdminLayout>
            <Head title="Driver Profiles" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Driver Profiles</h1>
                        <p className="mt-2 text-muted-foreground">
                            Manage driver profiles, pricing, and availability
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex h-[68px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex h-[68px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex h-[68px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.on_duty}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex h-[68px] flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                            <UserX className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="on_duty">On Duty</SelectItem>
                                    <SelectItem value="off_duty">Off Duty</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Drivers Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Drivers ({drivers.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('name')}
                                    >
                                        Driver
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Employment</TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('hourly_fee')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Hourly Fee
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('daily_fee')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            Daily Fee
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('trips')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Trips
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleSort('rating')}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3" />
                                            Rating
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {drivers.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground">
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
                                                <Badge className={STATUS_CONFIG[driver.status].class}>
                                                    {STATUS_CONFIG[driver.status].label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {driver.owner ? (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="h-3 w-3" />
                                                        {driver.owner.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Independent</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatCurrency(driver.hourly_fee)}</TableCell>
                                            <TableCell>{formatCurrency(driver.daily_fee)}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{driver.completed_trips}</div>
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
                                                <div className="flex justify-end gap-2">
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

                        {/* Pagination */}
                        {drivers.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(drivers.current_page - 1) * drivers.per_page + 1} to{' '}
                                    {Math.min(drivers.current_page * drivers.per_page, drivers.total)} of{' '}
                                    {drivers.total} results
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: drivers.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === drivers.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(`/admin/driver-profiles?page=${page}`, filters)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
