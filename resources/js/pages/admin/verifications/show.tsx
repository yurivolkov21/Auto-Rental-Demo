import { type BreadcrumbItem, type UserVerification } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronLeft,
    Clock,
    FileText,
    IdCard,
    MapPin,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/admin/verifications';

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Pending Review',
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

export default function AdminVerificationShow({
    verification,
}: {
    verification: UserVerification;
}) {
    const [imageDialog, setImageDialog] = useState<string | null>(null);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Verifications',
            href: index().url,
        },
        {
            title: verification.user?.name || 'Details',
            href: show({ verification: verification.id }).url,
        },
    ];

    const StatusIcon = STATUS_CONFIG[verification.status].icon;

    const getAvatarUrl = (avatar: string | null | undefined): string | null => {
        if (!avatar) return null;
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            return avatar;
        }
        return `/storage/${avatar}`;
    };

    const getImageUrl = (image: string | null | undefined): string | null => {
        if (!image) return null;
        return `/storage/${image}`;
    };

    const handleApprove = () => {
        if (confirm('Are you sure you want to approve this verification?')) {
            router.post(
                `/admin/verifications/${verification.id}/approve`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        alert('Verification approved successfully!');
                    },
                }
            );
        }
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        router.post(
            `/admin/verifications/${verification.id}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectDialogOpen(false);
                    setRejectReason('');
                    alert('Verification rejected successfully!');
                },
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verification - ${verification.user?.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={index().url}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <HeadingSmall
                            title="Verification Details"
                            description="Review user identity verification submission"
                        />
                    </div>
                    <Badge className={STATUS_CONFIG[verification.status].color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {STATUS_CONFIG[verification.status].label}
                    </Badge>
                </div>

                {/* Action Buttons */}
                {verification.status === 'pending' && (
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">
                                    Action Required
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Please review the documents and approve or reject this
                                    verification
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setRejectDialogOpen(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button variant="default" onClick={handleApprove}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rejection Info */}
                {verification.status === 'rejected' && verification.rejected_reason && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Rejected</AlertTitle>
                        <AlertDescription>
                            <p className="mb-2">
                                <strong>Reason:</strong> {verification.rejected_reason}
                            </p>
                            {verification.rejector && (
                                <p className="text-sm">
                                    Rejected by {verification.rejector.name} on{' '}
                                    {verification.rejected_at &&
                                        format(
                                            new Date(verification.rejected_at),
                                            'MMM dd, yyyy'
                                        )}
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Verification Info */}
                {verification.status === 'verified' && verification.verifier && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-900 dark:text-green-100">
                            Verified
                        </AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            Verified by {verification.verifier.name} on{' '}
                            {verification.verified_at &&
                                format(new Date(verification.verified_at), 'MMM dd, yyyy')}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* User Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                User Information
                            </CardTitle>
                            <CardDescription>Basic user details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage
                                        src={getAvatarUrl(verification.user?.avatar) || undefined}
                                        alt={verification.user?.name}
                                    />
                                    <AvatarFallback className="text-lg">
                                        {verification.user?.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-semibold">
                                        {verification.user?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {verification.user?.email}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                                {verification.user?.phone && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-medium">
                                            {verification.user.phone}
                                        </span>
                                    </div>
                                )}
                                {verification.user?.date_of_birth && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Date of Birth:</span>
                                        <span className="font-medium">
                                            {format(
                                                new Date(verification.user.date_of_birth),
                                                'MMM dd, yyyy'
                                            )}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Role:</span>
                                    <Badge variant="outline">
                                        {verification.user?.role.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Submitted:</span>
                                    <span className="font-medium">
                                        {format(new Date(verification.created_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Driving License Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IdCard className="h-5 w-5" />
                                Driving License
                            </CardTitle>
                            <CardDescription>License details and documentation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">License Number:</span>
                                    <span className="font-mono font-medium">
                                        {verification.driving_license_number || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">License Type:</span>
                                    <Badge variant="secondary">
                                        {verification.license_type || 'N/A'}
                                    </Badge>
                                </div>
                                {verification.license_issue_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Issue Date:</span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            {format(
                                                new Date(verification.license_issue_date),
                                                'MMM dd, yyyy'
                                            )}
                                        </span>
                                    </div>
                                )}
                                {verification.license_expiry_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Expiry Date:</span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            {format(
                                                new Date(verification.license_expiry_date),
                                                'MMM dd, yyyy'
                                            )}
                                        </span>
                                    </div>
                                )}
                                {verification.license_issued_country && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Issued Country:
                                        </span>
                                        <span className="flex items-center gap-1 font-medium">
                                            <MapPin className="h-3 w-3" />
                                            {verification.license_issued_country}
                                        </span>
                                    </div>
                                )}
                                {verification.nationality && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Nationality:</span>
                                        <span className="font-medium">
                                            {verification.nationality}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Uploaded Documents
                        </CardTitle>
                        <CardDescription>
                            Click on any image to view in full size
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {/* License Image */}
                            <div className="space-y-2">
                                <Label>Driving License Photo</Label>
                                {verification.driving_license_image ? (
                                    <div
                                        className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border"
                                        onClick={() =>
                                            setImageDialog(
                                                getImageUrl(verification.driving_license_image)
                                            )
                                        }
                                    >
                                        <img
                                            src={getImageUrl(verification.driving_license_image)!}
                                            alt="Driving License"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <p className="text-sm text-white">Click to enlarge</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted">
                                        <p className="text-sm text-muted-foreground">
                                            No image uploaded
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* ID Image */}
                            <div className="space-y-2">
                                <Label>Government ID Photo</Label>
                                {verification.id_image ? (
                                    <div
                                        className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border"
                                        onClick={() =>
                                            setImageDialog(getImageUrl(verification.id_image))
                                        }
                                    >
                                        <img
                                            src={getImageUrl(verification.id_image)!}
                                            alt="Government ID"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <p className="text-sm text-white">Click to enlarge</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted">
                                        <p className="text-sm text-muted-foreground">
                                            No image uploaded
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Selfie Image */}
                            <div className="space-y-2">
                                <Label>Selfie Photo</Label>
                                {verification.selfie_image ? (
                                    <div
                                        className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border"
                                        onClick={() =>
                                            setImageDialog(getImageUrl(verification.selfie_image))
                                        }
                                    >
                                        <img
                                            src={getImageUrl(verification.selfie_image)!}
                                            alt="Selfie"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <p className="text-sm text-white">Click to enlarge</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted">
                                        <p className="text-sm text-muted-foreground">
                                            No image uploaded
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Image Dialog */}
            <Dialog open={!!imageDialog} onOpenChange={() => setImageDialog(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Document Preview</DialogTitle>
                    </DialogHeader>
                    {imageDialog && (
                        <div className="relative aspect-video w-full">
                            <img
                                src={imageDialog}
                                alt="Document"
                                className="h-full w-full rounded-lg object-contain"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Verification</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">
                                Reason for Rejection <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="Please provide a clear reason for rejecting this verification..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                This reason will be visible to the user.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive">
                                Reject Verification
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
