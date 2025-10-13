import { type User, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Car,
    CheckCircle,
    ChevronLeft,
    Edit,
    Key,
    Mail,
    MapPin,
    Phone,
    Shield,
    UserCheck,
    UserCog,
    Users as UsersIcon,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

export default function AdminUserShow({ user }: { user: User }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Users', href: '/admin/users' },
        { title: user.name, href: `/admin/users/${user.id}` },
    ];

    // Dialog states
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    // Form states
    const [newStatus, setNewStatus] = useState(user.status);
    const [statusNote, setStatusNote] = useState('');
    const [newRole, setNewRole] = useState(user.role);
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

    // Helper functions
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getAvatarUrl = (avatar: string | null | undefined): string | undefined => {
        if (!avatar) return undefined;
        // If it's a full URL (http/https), return as is
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            return avatar;
        }
        // Otherwise, it's a storage path - prepend /storage/
        return `/storage/${avatar}`;
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
        return icons[role as keyof typeof icons];
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

    // Action handlers
    const handleChangeStatus = () => {
        router.post(
            `/admin/users/${user.id}/change-status`,
            {
                status: newStatus,
                note: statusNote,
            },
            {
                onSuccess: () => {
                    setStatusDialogOpen(false);
                    setStatusNote('');
                },
            }
        );
    };

    const handleChangeRole = () => {
        router.post(
            `/admin/users/${user.id}/change-role`,
            {
                role: newRole,
            },
            {
                onSuccess: () => {
                    setRoleDialogOpen(false);
                },
            }
        );
    };

    const handleResetPassword = () => {
        router.post(
            `/admin/users/${user.id}/reset-password`,
            {
                password: newPassword,
                password_confirmation: newPasswordConfirmation,
            },
            {
                onSuccess: () => {
                    setPasswordDialogOpen(false);
                    setNewPassword('');
                    setNewPasswordConfirmation('');
                },
            }
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - User Details`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/users">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                User ID: #{user.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Change Status
                        </Button>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(true)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Change Role
                        </Button>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/users/${user.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Profile Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>User's basic profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} />
                                        <AvatarFallback className="text-2xl">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold">{user.name}</h2>
                                        <div className="flex gap-2 mt-2">
                                            <Badge className={getRoleBadgeClass(user.role)}>
                                                {getRoleIcon(user.role)}
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </Badge>
                                            <Badge className={getStatusBadgeClass(user.status)}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </Badge>
                                            {user.email_verified_at ? (
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
                                        </div>
                                    </div>
                                </div>

                                {user.bio && (
                                    <div>
                                        <Label className="text-muted-foreground">Biography</Label>
                                        <p className="mt-1">{user.bio}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>Ways to reach this user</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <Label className="text-muted-foreground">Email</Label>
                                            <p className="font-medium">{user.email}</p>
                                            {user.email_verified_at && (
                                                <p className="text-xs text-muted-foreground">
                                                    Verified on {formatDate(user.email_verified_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div className="flex items-start gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <Label className="text-muted-foreground">Phone</Label>
                                                <p className="font-medium">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.address && (
                                        <div className="flex items-start gap-3 sm:col-span-2">
                                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <Label className="text-muted-foreground">Address</Label>
                                                <p className="font-medium">{user.address}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.date_of_birth && (
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div className="flex-1">
                                                <Label className="text-muted-foreground">Date of Birth</Label>
                                                <p className="font-medium">{formatDate(user.date_of_birth)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Details</CardTitle>
                                <CardDescription>Technical account information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label className="text-muted-foreground">User ID</Label>
                                        <p className="font-mono text-sm">{user.id}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Join Date</Label>
                                        <p className="text-sm">{formatDate(user.created_at)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground">Last Updated</Label>
                                        <p className="text-sm">{formatDateTime(user.updated_at)}</p>
                                    </div>
                                    {user.email_verified_at && (
                                        <div>
                                            <Label className="text-muted-foreground">Email Verified</Label>
                                            <p className="text-sm">{formatDateTime(user.email_verified_at)}</p>
                                        </div>
                                    )}
                                    {user.provider && (
                                        <>
                                            <div>
                                                <Label className="text-muted-foreground">OAuth Provider</Label>
                                                <p className="text-sm capitalize">{user.provider}</p>
                                            </div>
                                            <div>
                                                <Label className="text-muted-foreground">Provider ID</Label>
                                                <p className="font-mono text-xs">{user.provider_id}</p>
                                            </div>
                                        </>
                                    )}
                                    {user.two_factor_confirmed_at && (
                                        <div>
                                            <Label className="text-muted-foreground">2FA Enabled</Label>
                                            <p className="text-sm">
                                                {formatDateTime(user.two_factor_confirmed_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Verification Status */}
                        {user.verification && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verification Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge
                                        className={
                                            user.verification.status === 'verified'
                                                ? 'bg-green-100 text-green-800'
                                                : user.verification.status === 'pending'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : user.verification.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }
                                    >
                                        {user.verification.status.charAt(0).toUpperCase() +
                                            user.verification.status.slice(1)}
                                    </Badge>
                                    <Button variant="link" className="mt-4 p-0" asChild>
                                        <Link href={`/admin/verifications/${user.verification.id}`}>
                                            View Verification Details →
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Meta Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Meta Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <Label className="text-muted-foreground">Created At</Label>
                                    <p>{formatDateTime(user.created_at)}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Updated At</Label>
                                    <p>{formatDateTime(user.updated_at)}</p>
                                </div>
                                {user.status_changed_at && (
                                    <>
                                        <div>
                                            <Label className="text-muted-foreground">Status Last Changed</Label>
                                            <p>{formatDateTime(user.status_changed_at)}</p>
                                        </div>
                                        {user.status_changer && (
                                            <div>
                                                <Label className="text-muted-foreground">Changed By</Label>
                                                <p>{user.status_changer.name}</p>
                                            </div>
                                        )}
                                        {user.status_note && (
                                            <div>
                                                <Label className="text-muted-foreground">Status Note</Label>
                                                <p className="text-sm whitespace-pre-wrap">{user.status_note}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Change Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Status</DialogTitle>
                        <DialogDescription>
                            Update the status for <strong>{user.name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">New Status</Label>
                            <Select
                                value={newStatus}
                                onValueChange={(value) =>
                                    setNewStatus(
                                        value as 'active' | 'inactive' | 'suspended' | 'banned'
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(newStatus === 'suspended' || newStatus === 'banned') && (
                            <div className="space-y-2">
                                <Label htmlFor="note">
                                    Reason <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="note"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Explain why this action is being taken..."
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                    This reason will be shown to the user when they try to log in.
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangeStatus}>Change Status</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for <strong>{user.name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="role">New Role</Label>
                            <Select
                                value={newRole}
                                onValueChange={(value) => setNewRole(value as 'customer' | 'owner' | 'admin')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="customer">Customer</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleChangeRole}>Change Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset User Password</DialogTitle>
                        <DialogDescription>
                            Set a new password for <strong>{user.name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                New Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min. 8 characters)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={newPasswordConfirmation}
                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleResetPassword}>Reset Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
