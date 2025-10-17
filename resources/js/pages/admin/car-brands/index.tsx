import { type CarBrand, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, Edit, Eye, Plus, Search } from 'lucide-react';
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
        title: 'Car Brands',
        href: '/admin/car-brands',
    },
];

interface Stats {
    total: number;
    active: number;
    inactive: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: CarBrand[];
}

export default function AdminCarBrandsIndex({
    brands,
    filters,
    stats,
}: {
    brands: Pagination;
    filters: {
        status: string;
        search: string;
    };
    stats: Stats;
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            '/admin/car-brands',
            { status, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/car-brands',
            { status: statusFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleToggleStatus = (brand: CarBrand) => {
        router.post(`/admin/car-brands/${brand.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Car Brands Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Car Brands Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage car manufacturers and brands
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/car-brands/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Brand
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Brands
                            </CardTitle>
                            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                All registered brands
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Active Brands
                            </CardTitle>
                            <BadgeCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently available
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Inactive Brands
                            </CardTitle>
                            <BadgeCheck className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive}</div>
                            <p className="text-xs text-muted-foreground">
                                Temporarily disabled
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Brands Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Car Brands</CardTitle>
                        <CardDescription>
                            Filter and search through all car brands
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Filters */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name..."
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
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cars</TableHead>
                                    <TableHead>Sort Order</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {brands.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No brands found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    brands.data.map((brand) => (
                                        <TableRow key={brand.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {brand.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {brand.slug}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        brand.is_active
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                                    }
                                                >
                                                    {brand.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground">
                                                    {brand.cars_count || 0} car{(brand.cars_count || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>{brand.sort_order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/car-brands/${brand.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/car-brands/${brand.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(brand)}
                                                    >
                                                        <BadgeCheck
                                                            className={`h-4 w-4 ${
                                                                brand.is_active
                                                                    ? 'text-green-600'
                                                                    : 'text-gray-400'
                                                            }`}
                                                        />
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
                        {brands.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((brands.current_page - 1) * brands.per_page) + 1} to{' '}
                                    {Math.min(brands.current_page * brands.per_page, brands.total)} of{' '}
                                    {brands.total} brands
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={brands.current_page === 1}
                                        onClick={() =>
                                            router.get(`/admin/car-brands?page=${brands.current_page - 1}`)
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={brands.current_page === brands.last_page}
                                        onClick={() =>
                                            router.get(`/admin/car-brands?page=${brands.current_page + 1}`)
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
