import { type Car, type CarBrand, type CarCategory, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Car as CarIcon,
    CheckCircle,
    Edit,
    Eye,
    Plus,
    Search,
    Wrench,
    Key,
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
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Cars',
        href: '/admin/cars',
    },
];

interface Stats {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Car[];
}

export default function AdminCarsIndex({
    cars,
    filters,
    stats,
    brands,
    categories,
}: {
    cars: Pagination;
    filters: {
        status: string;
        category: string;
        brand: string;
        verified: string;
        search: string;
    };
    stats: Stats;
    brands: CarBrand[];
    categories: CarCategory[];
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [categoryFilter, setCategoryFilter] = useState(filters.category);
    const [brandFilter, setBrandFilter] = useState(filters.brand);
    const [verifiedFilter, setVerifiedFilter] = useState(filters.verified);
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/cars',
            {
                status,
                category: categoryFilter,
                brand: brandFilter,
                verified: verifiedFilter,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleCategoryFilterChange = (category: string) => {
        setCategoryFilter(category);
        router.get(
            '/admin/cars',
            {
                status: statusFilter,
                category,
                brand: brandFilter,
                verified: verifiedFilter,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleBrandFilterChange = (brand: string) => {
        setBrandFilter(brand);
        router.get(
            '/admin/cars',
            {
                status: statusFilter,
                category: categoryFilter,
                brand,
                verified: verifiedFilter,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleVerifiedFilterChange = (verified: string) => {
        setVerifiedFilter(verified);
        router.get(
            '/admin/cars',
            {
                status: statusFilter,
                category: categoryFilter,
                brand: brandFilter,
                verified,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/cars',
            {
                status: statusFilter,
                category: categoryFilter,
                brand: brandFilter,
                verified: verifiedFilter,
                search: searchQuery,
            },
            { preserveState: true }
        );
    };

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(num);
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            available: 'bg-green-100 text-green-800 border-green-200',
            rented: 'bg-blue-100 text-blue-800 border-blue-200',
            maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        };

        return (
            <Badge variant="outline" className={statusColors[status as keyof typeof statusColors]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTransmissionBadge = (transmission: string) => {
        if (transmission === 'automatic') {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Automatic
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Manual
            </Badge>
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Car Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Car Management</h1>
                        <p className="text-muted-foreground">
                            Manage vehicle inventory and rental fleet
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/cars/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Car
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Cars
                            </CardTitle>
                            <CarIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Complete vehicle inventory
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Available for Rent
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.available}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0
                                    ? Math.round((stats.available / stats.total) * 100)
                                    : 0}
                                % ready to rent
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Currently Rented
                            </CardTitle>
                            <Key className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.rented}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? Math.round((stats.rented / stats.total) * 100) : 0}
                                % in active rentals
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Under Maintenance
                            </CardTitle>
                            <Wrench className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.maintenance}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Vehicles in service
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters, Table and Pagination */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Cars</CardTitle>
                        <CardDescription>View and manage all vehicles in the fleet</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by model, license plate, VIN, owner, color..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>

                            <div className="grid gap-4 md:grid-cols-4">
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="available">Available</SelectItem>
                                        <SelectItem value="rented">Rented</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={brandFilter} onValueChange={handleBrandFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Brands</SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={verifiedFilter} onValueChange={handleVerifiedFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Verification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Cars Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Car</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>License Plate</TableHead>
                                        <TableHead>Transmission</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Daily Rate</TableHead>
                                        <TableHead>Rentals</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cars.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                No cars found. Try adjusting your filters.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cars.data.map((car) => (
                                            <TableRow key={car.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {car.brand?.name} {car.model}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {car.year} • {car.color || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{car.owner?.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {car.owner?.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{car.category?.name}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">{car.license_plate}</span>
                                                </TableCell>
                                                <TableCell>{getTransmissionBadge(car.transmission)}</TableCell>
                                                <TableCell>{getStatusBadge(car.status)}</TableCell>
                                                <TableCell>
                                                    {car.is_verified ? (
                                                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                                    ) : (
                                                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">
                                                        {formatCurrency(car.daily_rate)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{car.rental_count}</span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/cars/${car.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/cars/${car.id}/edit`}>
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
                        {cars.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(cars.current_page - 1) * cars.per_page + 1} to{' '}
                                    {Math.min(cars.current_page * cars.per_page, cars.total)} of {cars.total}{' '}
                                    results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={cars.current_page === 1}
                                        onClick={() =>
                                            router.get(`/admin/cars?page=${cars.current_page - 1}`, {
                                                status: statusFilter,
                                                category: categoryFilter,
                                                brand: brandFilter,
                                                verified: verifiedFilter,
                                                search: searchQuery,
                                            })
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={cars.current_page === cars.last_page}
                                        onClick={() =>
                                            router.get(`/admin/cars?page=${cars.current_page + 1}`, {
                                                status: statusFilter,
                                                category: categoryFilter,
                                                brand: brandFilter,
                                                verified: verifiedFilter,
                                                search: searchQuery,
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
