import { type CarCategory, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Search, Shapes } from 'lucide-react';
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
        title: 'Car Categories',
        href: '/admin/car-categories',
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
    data: CarCategory[];
}

export default function AdminCarCategoriesIndex({
    categories,
    filters,
    stats,
}: {
    categories: Pagination;
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
            '/admin/car-categories',
            { status, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/car-categories',
            { status: statusFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleToggleStatus = (category: CarCategory) => {
        router.post(`/admin/car-categories/${category.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Car Categories Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Car Categories Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage vehicle types and categories
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/car-categories/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Categories
                            </CardTitle>
                            <Shapes className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                All vehicle categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Active Categories
                            </CardTitle>
                            <Shapes className="h-4 w-4 text-green-600" />
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
                                Inactive Categories
                            </CardTitle>
                            <Shapes className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inactive}</div>
                            <p className="text-xs text-muted-foreground">
                                Temporarily disabled
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>
                            Filter and search car categories
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row">
                            {/* Status Filter */}
                            <div className="flex-1">
                                <Select
                                    value={statusFilter}
                                    onValueChange={handleStatusFilterChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                                <Input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Car Categories</CardTitle>
                        <CardDescription>
                            {categories.total} categor{categories.total !== 1 ? 'ies' : 'y'} found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Cars</TableHead>
                                    <TableHead>Sort Order</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            No categories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.data.map((category) => (
                                        <TableRow key={category.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">
                                                {category.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    {category.icon}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {category.slug}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        category.is_active
                                                            ? 'bg-green-100 text-green-800 border-green-200'
                                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                                    }
                                                >
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-muted-foreground">
                                                    {category.cars_count || 0} car{(category.cars_count || 0) !== 1 ? 's' : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>{category.sort_order}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/car-categories/${category.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link href={`/admin/car-categories/${category.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(category)}
                                                    >
                                                        <Shapes
                                                            className={`h-4 w-4 ${
                                                                category.is_active
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

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {((categories.current_page - 1) * categories.per_page) + 1} to{' '}
                                    {Math.min(categories.current_page * categories.per_page, categories.total)} of{' '}
                                    {categories.total} categories
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={categories.current_page === 1}
                                        onClick={() =>
                                            router.get(`/admin/car-categories?page=${categories.current_page - 1}`)
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={categories.current_page === categories.last_page}
                                        onClick={() =>
                                            router.get(`/admin/car-categories?page=${categories.current_page + 1}`)
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
