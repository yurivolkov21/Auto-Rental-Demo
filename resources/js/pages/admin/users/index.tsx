import { type User, type UserStats, type UserFilters, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    Edit,
    Eye,
    Search,
    Shield,
    Trash2,
    Users as UsersIcon,
    Car,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    { title: 'Users', href: '/admin/users' },
];

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: User[];
}

export default function AdminUsersIndex({
    users,
    filters,
    stats,
}: {
    users: Pagination;
    filters: UserFilters;
    stats: UserStats;
}) {
    const [roleFilter, setRoleFilter] = useState(filters.role);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [verifiedFilter, setVerifiedFilter] = useState(filters.verified);
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleRoleFilterChange = (role: string) => {
        setRoleFilter(role as typeof roleFilter);
        router.get(
            '/admin/users',
            { role, status: statusFilter, verified: verifiedFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status as typeof statusFilter);
        router.get(
            '/admin/users',
            { role: roleFilter, status, verified: verifiedFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleVerifiedFilterChange = (verified: string) => {
        setVerifiedFilter(verified as typeof verifiedFilter);
        router.get(
            '/admin/users',
            { role: roleFilter, status: statusFilter, verified, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/users',
            { role: roleFilter, status: statusFilter, verified: verifiedFilter, search: searchQuery },
            { preserveState: true }
        );
    };

    const handleDelete = () => {
        if (!selectedUser) return;

        router.delete(`/admin/users/${selectedUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleBadgeClass = (role: string) => {
        const classes = {
            customer: 'bg-blue-100 text-blue-800',
            owner: 'bg-purple-100 text-purple-800',
            admin: 'bg-red-100 text-red-800',
        };
        return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const getRoleIcon = (role: string) => {
        const icons = {
            customer: <UsersIcon className="mr-1 h-3 w-3" />,
            owner: <Car className="mr-1 h-3 w-3" />,
            admin: <Shield className="mr-1 h-3 w-3" />,
        };
        return icons[role as keyof typeof icons] || null;
    };

    const getStatusBadgeClass = (status: string) => {
        const classes = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-orange-100 text-orange-800',
            banned: 'bg-red-100 text-red-800',
        };
        return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage users, roles, and permissions across the platform
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Total Users</CardTitle>
                            <UsersIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Customers</CardTitle>
                            <UsersIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.customers}</div>
                            <p className="text-xs text-muted-foreground mt-1">Regular customers</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Owners</CardTitle>
                            <Car className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.owners}</div>
                            <p className="text-xs text-muted-foreground mt-1">Car owners</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Admins</CardTitle>
                            <Shield className="h-4 w-4 text-red-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.admins}</div>
                            <p className="text-xs text-muted-foreground mt-1">Platform admins</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Verified</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.verified}</div>
                            <p className="text-xs text-muted-foreground mt-1">Email verified</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 h-[68px]">
                            <CardTitle className="text-sm font-medium leading-tight">Active</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="text-2xl font-bold">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                        <CardDescription>View and manage all user accounts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search by name, email, or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>

                            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={verifiedFilter} onValueChange={handleVerifiedFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Verified" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="yes">Verified</SelectItem>
                                    <SelectItem value="no">Unverified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Users Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={user.avatar || undefined} />
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getRoleBadgeClass(user.role)}>
                                                        {getRoleIcon(user.role)}
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadgeClass(user.status)}>
                                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.verification?.status === 'verified' ? (
                                                        <Badge className="bg-green-100 text-green-800">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Verified
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-100 text-gray-800">
                                                            <X className="mr-1 h-3 w-3" />
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/admin/users/${user.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
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
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(users.current_page - 1) * users.per_page + 1} to{' '}
                                    {Math.min(users.current_page * users.per_page, users.total)} of {users.total}{' '}
                                    results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={users.current_page === 1}
                                        onClick={() =>
                                            router.get(`/admin/users?page=${users.current_page - 1}`, {
                                                role: roleFilter,
                                                status: statusFilter,
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
                                        disabled={users.current_page === users.last_page}
                                        onClick={() =>
                                            router.get(`/admin/users?page=${users.current_page + 1}`, {
                                                role: roleFilter,
                                                status: statusFilter,
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action will
                            soft delete the account and it can be restored within 30 days.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
