import { type Location, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Clock, Edit, Eye, MapPin, Plane, Search, X } from 'lucide-react';
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
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Locations',
        href: '/admin/locations',
    },
];

interface Stats {
    total: number;
    active: number;
    inactive: number;
    airports: number;
    popular: number;
    is_24_7: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Location[];
}

export default function AdminLocationsIndex({
    locations,
    filters,
    stats,
}: {
    locations: Pagination;
    filters: {
        status: string;
        type: string;
        search: string;
    };
    stats: Stats;
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [typeFilter, setTypeFilter] = useState(filters.type);
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/locations',
            { status, type: typeFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleTypeFilterChange = (type: string) => {
        setTypeFilter(type);
        router.get(
            '/admin/locations',
            { status: statusFilter, type, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/locations',
            { status: statusFilter, type: typeFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Location Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Location Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage pickup and dropoff locations
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/locations/create">
                            <MapPin className="mr-2 h-4 w-4" />
                            Add Location
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Locations
                            </CardTitle>
                            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All pickup/dropoff points
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Active Locations
                            </CardTitle>
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% operational
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Airport Locations
                            </CardTitle>
                            <Plane className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.airports}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Near airports & terminals
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                24/7 Locations
                            </CardTitle>
                            <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.is_24_7}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Always available
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Locations</CardTitle>
                        <CardDescription>
                            Filter and search through all locations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name or address..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>

                            <Select
                                value={statusFilter}
                                onValueChange={handleStatusFilterChange}
                            >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={typeFilter}
                                onValueChange={handleTypeFilterChange}
                            >
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="airport">Airport</SelectItem>
                                    <SelectItem value="popular">Popular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Hours</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No locations found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        locations.data.map((location) => (
                                            <TableRow key={location.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-blue-600" />
                                                        {location.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {location.address}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {location.is_airport && (
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                                                <Plane className="mr-1 h-3 w-3" />
                                                                Airport
                                                            </Badge>
                                                        )}
                                                        {location.is_popular && (
                                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                                Popular
                                                            </Badge>
                                                        )}
                                                        {!location.is_airport && !location.is_popular && (
                                                            <span className="text-muted-foreground text-sm">Standard</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={location.is_active ? 'default' : 'secondary'}
                                                        className={
                                                            location.is_active
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                        }
                                                    >
                                                        {location.is_active ? (
                                                            <>
                                                                <Check className="mr-1 h-3 w-3" />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="mr-1 h-3 w-3" />
                                                                Inactive
                                                            </>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {location.is_24_7 ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            <Clock className="mr-1 h-3 w-3" />
                                                            24/7
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            {location.opening_time} - {location.closing_time}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="View details"
                                                        >
                                                            <Link href={`/admin/locations/${location.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="Edit location"
                                                        >
                                                            <Link href={`/admin/locations/${location.id}/edit`}>
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
                        {locations.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {locations.current_page} of {locations.last_page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={locations.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                '/admin/locations',
                                                {
                                                    ...filters,
                                                    page: locations.current_page - 1,
                                                },
                                                { preserveState: true }
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={locations.current_page === locations.last_page}
                                        onClick={() =>
                                            router.get(
                                                '/admin/locations',
                                                {
                                                    ...filters,
                                                    page: locations.current_page + 1,
                                                },
                                                { preserveState: true }
                                            )
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
