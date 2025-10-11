import { type BreadcrumbItem, type UserVerification } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, Clock, Eye, Search, XCircle } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/admin/verifications';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Verifications',
        href: index().url,
    },
];

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Pending',
    },
    verified: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Verified',
    },
    rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Rejected',
    },
    expired: {
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        label: 'Expired',
    },
};

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: UserVerification[];
}

export default function AdminVerificationsIndex({
    verifications,
    filters,
}: {
    verifications: Pagination;
    filters: {
        status: string;
        search: string;
    };
}) {
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const handleFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            index().url,
            { status, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            index().url,
            { status: statusFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const getAvatarUrl = (avatar: string | null | undefined): string | null => {
        if (!avatar) return null;
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            return avatar;
        }
        return `/storage/${avatar}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verification Management" />

            <div className="space-y-6">
                <HeadingSmall
                    title="Verification Management"
                    description="Review and manage user identity verifications"
                />

                <Card>
                    <CardHeader>
                        <CardTitle>User Verifications</CardTitle>
                        <CardDescription>
                            Filter and search through user verification submissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <Button type="submit">Search</Button>
                                </form>
                            </div>
                            <div className="w-full sm:w-48">
                                <Select
                                    value={statusFilter}
                                    onValueChange={handleFilterChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="text-sm text-muted-foreground">
                            Showing {verifications.data.length} of {verifications.total}{' '}
                            verification(s)
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>License Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {verifications.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                            >
                                                No verifications found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        verifications.data.map((verification) => {
                                            const StatusIcon =
                                                STATUS_CONFIG[verification.status].icon;
                                            return (
                                                <TableRow key={verification.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage
                                                                    src={
                                                                        getAvatarUrl(
                                                                            verification.user
                                                                                ?.avatar
                                                                        ) || undefined
                                                                    }
                                                                    alt={
                                                                        verification.user
                                                                            ?.name
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {verification.user?.name
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')
                                                                        .toUpperCase()
                                                                        .slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        verification.user
                                                                            ?.name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {
                                                                        verification.user
                                                                            ?.email
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="font-mono text-sm">
                                                            {verification.license_type ||
                                                                'N/A'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                STATUS_CONFIG[
                                                                    verification.status
                                                                ].color
                                                            }
                                                        >
                                                            <StatusIcon className="mr-1 h-3 w-3" />
                                                            {
                                                                STATUS_CONFIG[
                                                                    verification.status
                                                                ].label
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm">
                                                            {format(
                                                                new Date(
                                                                    verification.created_at
                                                                ),
                                                                'MMM dd, yyyy'
                                                            )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={
                                                                    show({
                                                                        verification:
                                                                            verification.id,
                                                                    }).url
                                                                }
                                                            >
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {verifications.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {verifications.current_page} of{' '}
                                    {verifications.last_page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={verifications.current_page === 1}
                                        onClick={() =>
                                            router.get(
                                                index().url,
                                                {
                                                    status: statusFilter,
                                                    search: searchQuery,
                                                    page: verifications.current_page - 1,
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
                                        disabled={
                                            verifications.current_page ===
                                            verifications.last_page
                                        }
                                        onClick={() =>
                                            router.get(
                                                index().url,
                                                {
                                                    status: statusFilter,
                                                    search: searchQuery,
                                                    page: verifications.current_page + 1,
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
        </AppLayout>
    );
}
