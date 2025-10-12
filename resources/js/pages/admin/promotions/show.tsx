import { type Promotion, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    Calendar,
    Check,
    ChevronLeft,
    DollarSign,
    Edit,
    Percent,
    Star,
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
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    promotion: Promotion;
}

export default function AdminPromotionsShow({ promotion }: Props) {
    const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Promotions',
            href: '/admin/promotions',
        },
        {
            title: promotion.code,
            href: `/admin/promotions/${promotion.id}`,
        },
    ];

    const handleToggleStatus = () => {
        router.post(
            `/admin/promotions/${promotion.id}/toggle-status`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setToggleDialogOpen(false);
                },
                onError: () => {
                    setToggleDialogOpen(false);
                },
            }
        );
    };

    const handleArchive = () => {
        router.post(
            `/admin/promotions/${promotion.id}/archive`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setArchiveDialogOpen(false);
                },
                onError: () => {
                    setArchiveDialogOpen(false);
                },
            }
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = () => {
        const now = new Date();
        const endDate = new Date(promotion.end_date);

        // Check if expired (only for non-archived)
        if (promotion.status !== 'archived' && endDate < now) {
            return (
                <Badge className="bg-gray-100 text-gray-800">
                    <X className="mr-1 h-3 w-3" />
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

        const statusIcons: Record<Promotion['status'], React.ReactNode> = {
            active: <Check className="mr-1 h-3 w-3" />,
            paused: <X className="mr-1 h-3 w-3" />,
            upcoming: <Calendar className="mr-1 h-3 w-3" />,
            archived: <Archive className="mr-1 h-3 w-3" />,
        };

        return (
            <Badge className={statusColors[promotion.status]}>
                {statusIcons[promotion.status]}
                {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1)}
            </Badge>
        );
    };

    const usagePercentage = promotion.max_uses
        ? Math.round((promotion.used_count / promotion.max_uses) * 100)
        : 0;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${promotion.code} - Promotion Details`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/promotions">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight font-mono">
                                    {promotion.code}
                                </h1>
                                {promotion.is_featured && (
                                    <Star className="h-5 w-5 text-orange-600 fill-orange-600" />
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {promotion.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setToggleDialogOpen(true)}
                            disabled={promotion.status === 'archived'}
                        >
                            {promotion.status === 'active' ? (
                                <>
                                    <X className="mr-2 h-4 w-4" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button variant="outline" asChild disabled={promotion.status === 'archived'}>
                            <Link href={`/admin/promotions/${promotion.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {promotion.status !== 'archived' && (
                            <Button
                                variant="destructive"
                                onClick={() => setArchiveDialogOpen(true)}
                            >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status & Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status & Type</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {getStatusBadge()}
                                    <Badge
                                        variant="outline"
                                        className={
                                            promotion.discount_type === 'percentage'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }
                                    >
                                        {promotion.discount_type === 'percentage' ? (
                                            <>
                                                <Percent className="mr-1 h-3 w-3" />
                                                Percentage Discount
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="mr-1 h-3 w-3" />
                                                Fixed Amount
                                            </>
                                        )}
                                    </Badge>
                                    {promotion.is_auto_apply && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Auto-apply
                                        </Badge>
                                    )}
                                </div>

                                {promotion.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {promotion.description}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Discount Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Discount Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Discount Value</p>
                                        <p className="text-2xl font-bold text-purple-700">
                                            {promotion.discount_type === 'percentage'
                                                ? `${promotion.discount_value}%`
                                                : formatCurrency(promotion.discount_value)}
                                        </p>
                                    </div>
                                    {promotion.discount_type === 'percentage' &&
                                        promotion.max_discount && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Max Discount Cap
                                                </p>
                                                <p className="text-xl font-semibold">
                                                    {formatCurrency(promotion.max_discount)}
                                                </p>
                                            </div>
                                        )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                                <CardDescription>
                                    Minimum conditions to use this promotion
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Minimum Rental Amount
                                    </span>
                                    <span className="font-medium">
                                        {parseFloat(promotion.min_amount) > 0
                                            ? formatCurrency(promotion.min_amount)
                                            : 'No minimum'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Minimum Rental Hours
                                    </span>
                                    <span className="font-medium">
                                        {promotion.min_rental_hours} hours
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Usage</span>
                                        <span className="font-medium">
                                            {promotion.used_count}
                                            {promotion.max_uses && (
                                                <span className="text-muted-foreground">
                                                    {' / '}{promotion.max_uses}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {promotion.max_uses && (
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-600 transition-all"
                                                style={{
                                                    width: `${usagePercentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Per User Limit
                                    </span>
                                    <span className="font-medium">
                                        {promotion.max_uses_per_user} times
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Priority</span>
                                    <Badge variant="outline">
                                        Priority {promotion.priority}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Validity Period */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Validity Period</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {formatDate(promotion.start_date)}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm font-medium">
                                            {formatDate(promotion.end_date)}
                                        </p>
                                    </div>
                                </div>

                                {(() => {
                                    const now = new Date();
                                    const start = new Date(promotion.start_date);
                                    const end = new Date(promotion.end_date);
                                    const daysRemaining = Math.ceil(
                                        (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                                    );

                                    if (end < now) {
                                        return (
                                            <div className="mt-3 p-3 bg-red-50 rounded-md">
                                                <p className="text-sm font-medium text-red-800">
                                                    Promotion has expired
                                                </p>
                                            </div>
                                        );
                                    }

                                    if (start > now) {
                                        return (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                <p className="text-sm font-medium text-blue-800">
                                                    Starts in the future
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="mt-3 p-3 bg-green-50 rounded-md">
                                            <p className="text-sm font-medium text-green-800">
                                                {daysRemaining} days remaining
                                            </p>
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>

                        {/* Meta Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Meta Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Created By</p>
                                    <p className="text-sm font-medium">
                                        {promotion.creator?.name || 'Unknown'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground">Created At</p>
                                    <p className="text-sm">
                                        {formatDate(promotion.created_at)}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-xs text-muted-foreground">Last Updated</p>
                                    <p className="text-sm">
                                        {formatDate(promotion.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Toggle Status Dialog */}
            <Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {promotion.status === 'active' ? 'Pause' : 'Activate'} Promotion
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to{' '}
                            {promotion.status === 'active' ? 'pause' : 'activate'}{' '}
                            <strong>{promotion.code}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setToggleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleToggleStatus}>
                            {promotion.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive Dialog */}
            <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Promotion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{promotion.code}</strong>?
                            <span className="block mt-2 text-red-600 font-medium">
                                This action is permanent. Archived promotions cannot be reactivated or used.
                                Use this when the promotion has expired or reached its usage limit.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleArchive}>
                            Archive
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
