import { type Promotion, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    Eye,
    Percent,
    Plus,
    Search,
    Star,
    Tag,
    TrendingUp,
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
        title: 'Promotions',
        href: '/admin/promotions',
    },
];

interface Stats {
    total: number;
    active: number;
    paused: number;
    archived: number;
    featured: number;
    total_uses: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: Promotion[];
}

export default function AdminPromotionsIndex({
    promotions,
    filters,
    stats,
}: {
    promotions: Pagination;
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
            '/admin/promotions',
            { status, type: typeFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleTypeFilterChange = (type: string) => {
        setTypeFilter(type);
        router.get(
            '/admin/promotions',
            { status: statusFilter, type, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/promotions',
            { status: statusFilter, type: typeFilter, search: searchQuery },
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (promotion: Promotion) => {
        const now = new Date();
        const endDate = new Date(promotion.end_date);

        // Check if expired (only for non-archived)
        if (promotion.status !== 'archived' && endDate < now) {
            return (
                <Badge className="bg-gray-100 text-gray-800">
                    Expired
                </Badge>
            );
        }

        // Check status
        const statusColors: Record<Promotion['status'], string> = {
            active: 'bg-green-100 text-green-800',
            paused: 'bg-yellow-100 text-yellow-800',
            upcoming: 'bg-blue-100 text-blue-800',
            archived: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge className={statusColors[promotion.status]}>
                {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
            </Badge>
        );
    };

    const getTypeBadge = (type: 'percentage' | 'fixed_amount') => {
        if (type === 'percentage') {
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Percent className="mr-1 h-3 w-3" />
                    Percentage
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Fixed Amount
            </Badge>
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Promotion Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Promotion Management
                        </h1>
                        <p className="text-muted-foreground">
                            Manage discount codes and promotional offers
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/promotions/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Promotion
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Promotions
                            </CardTitle>
                            <Tag className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                All promotional offers
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Active Promotions
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% currently valid
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Featured Promotions
                            </CardTitle>
                            <Star className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.featured}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Highlighted on homepage
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">
                                Total Usage
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">
                                {stats.total_uses.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Times promotions applied
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Promotions</CardTitle>
                        <CardDescription>
                            Filter and search through all promotions
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
                                        placeholder="Search by code or name..."
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
                                    <SelectItem value="paused">Paused</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
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
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead>Valid Period</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promotions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No promotions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        promotions.data.map((promotion) => (
                                            <TableRow key={promotion.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <code className="font-mono font-semibold">
                                                            {promotion.code}
                                                        </code>
                                                        {promotion.is_featured && (
                                                            <Star className="h-3 w-3 text-orange-600 fill-orange-600" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {promotion.name}
                                                </TableCell>
                                                <TableCell>
                                                    {promotion.discount_type === 'percentage' ? (
                                                        <span className="font-semibold text-purple-700">
                                                            {promotion.discount_value}%
                                                        </span>
                                                    ) : (
                                                        <span className="font-semibold text-blue-700">
                                                            {formatCurrency(promotion.discount_value)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {getTypeBadge(promotion.discount_type)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(promotion)}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">
                                                        {promotion.used_count}
                                                        {promotion.max_uses && (
                                                            <span className="text-muted-foreground">
                                                                {' / '}{promotion.max_uses}
                                                            </span>
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{formatDate(promotion.start_date)}</div>
                                                        <div className="text-muted-foreground">
                                                            to {formatDate(promotion.end_date)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/promotions/${promotion.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/promotions/${promotion.id}/edit`}>
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
                        {promotions.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(promotions.current_page - 1) * promotions.per_page + 1}
                                    </span>
                                    {' - '}
                                    <span className="font-medium">
                                        {Math.min(
                                            promotions.current_page * promotions.per_page,
                                            promotions.total
                                        )}
                                    </span>
                                    {' of '}
                                    <span className="font-medium">{promotions.total}</span> promotions
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={promotions.current_page === 1}
                                        onClick={() => {
                                            router.get(`/admin/promotions?page=${promotions.current_page - 1}`, {
                                                status: statusFilter,
                                                type: typeFilter,
                                                search: searchQuery,
                                            });
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {promotions.current_page} of {promotions.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={promotions.current_page === promotions.last_page}
                                        onClick={() => {
                                            router.get(`/admin/promotions?page=${promotions.current_page + 1}`, {
                                                status: statusFilter,
                                                type: typeFilter,
                                                search: searchQuery,
                                            });
                                        }}
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
