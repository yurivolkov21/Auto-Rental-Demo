import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { DriverProfileWithRelations } from '@/types/models/driver-profile';
import { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    ChevronLeft,
    Edit,
    Clock,
    DollarSign,
    TrendingUp,
    Star,
    MapPin,
    User,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

interface Props {
    driver: DriverProfileWithRelations;
}

const STATUS_CONFIG = {
    available: { label: 'Available', class: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    on_duty: { label: 'On Duty', class: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    off_duty: { label: 'Off Duty', class: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
    suspended: { label: 'Suspended', class: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
};

const VERIFICATION_STATUS_CONFIG = {
    pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    verified: { label: 'Verified', class: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Rejected', class: 'bg-red-100 text-red-800 border-red-200' },
    expired: { label: 'Expired', class: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function Show({ driver }: Props) {
    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(numAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const StatusIcon = STATUS_CONFIG[driver.status].icon;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Driver Profiles', href: '/admin/driver-profiles' },
        { title: driver.user.name, href: `/admin/driver-profiles/${driver.id}` },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Driver: ${driver.user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/driver-profiles">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{driver.user.name}</h1>
                                <Badge variant="outline" className={STATUS_CONFIG[driver.status].class}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {STATUS_CONFIG[driver.status].label}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {driver.user.email}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={`/admin/driver-profiles/${driver.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="space-y-6 md:col-span-2">
                        {/* Driver Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Driver Information</CardTitle>
                                <CardDescription>Personal and contact details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            Full Name
                                        </Label>
                                        <p className="text-sm font-medium">{driver.user.name}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <p className="text-sm font-medium">{driver.user.email}</p>
                                    </div>
                                    {driver.user.date_of_birth && (
                                        <div className="space-y-1.5">
                                            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                Date of Birth
                                            </Label>
                                            <p className="text-sm font-medium">
                                                {formatDate(driver.user.date_of_birth)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing Configuration
                                </CardTitle>
                                <CardDescription>Driver service fees and rates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Hourly Fee</Label>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(driver.hourly_fee)}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Daily Fee</Label>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(driver.daily_fee)}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Overtime Fee/Hour</Label>
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(driver.overtime_fee_per_hour)}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Daily Hour Threshold</Label>
                                        <p className="text-lg font-semibold">{driver.daily_hour_threshold} hours</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Performance Metrics
                                </CardTitle>
                                <CardDescription>Driver statistics and ratings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Completed Trips</Label>
                                        <p className="text-2xl font-bold">{driver.completed_trips}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Average Rating</Label>
                                        {driver.average_rating ? (
                                            <p className="flex items-center gap-2 text-2xl font-bold">
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                                {parseFloat(driver.average_rating).toFixed(1)}
                                            </p>
                                        ) : (
                                            <p className="text-lg text-muted-foreground">No ratings yet</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Total KM Driven</Label>
                                        <p className="text-lg font-semibold">
                                            {driver.total_km_driven.toLocaleString()} km
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm text-muted-foreground">Total Hours Driven</Label>
                                        <p className="text-lg font-semibold">
                                            {driver.total_hours_driven.toLocaleString()} hours
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Working Hours */}
                        {driver.working_hours && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Working Hours
                                    </CardTitle>
                                    <CardDescription>Weekly schedule</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {Object.entries(driver.working_hours).map(([day, hours]) => (
                                            <div key={day} className="flex items-center justify-between rounded-lg border p-3">
                                                <span className="font-medium capitalize">{day}</span>
                                                <span className={hours === 'off' ? 'text-muted-foreground' : 'font-semibold'}>
                                                    {hours || 'Not set'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Status & Meta */}
                    <div className="space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Current Status</Label>
                                    <Badge className={`${STATUS_CONFIG[driver.status].class} flex w-fit items-center gap-2 px-3 py-1.5`}>
                                        <StatusIcon className="h-4 w-4" />
                                        {STATUS_CONFIG[driver.status].label}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Booking Availability</Label>
                                    <Badge className={driver.is_available_for_booking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                        {driver.is_available_for_booking ? 'Available' : 'Unavailable'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Employment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {driver.owner ? (
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Employed By</Label>
                                        <p className="font-medium">{driver.owner.name}</p>
                                        <p className="text-sm text-muted-foreground">{driver.owner.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Independent Driver</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Verification Status */}
                        {driver.verification && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verification</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Status</Label>
                                        <Badge className={VERIFICATION_STATUS_CONFIG[driver.verification.status].class}>
                                            {VERIFICATION_STATUS_CONFIG[driver.verification.status].label}
                                        </Badge>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/admin/verifications/${driver.verification.id}`}>
                                            View Verification
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Timestamps */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Timestamps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <Label className="text-sm text-muted-foreground">Created</Label>
                                    <p className="text-sm font-medium">{formatDate(driver.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-sm text-muted-foreground">Last Updated</Label>
                                    <p className="text-sm font-medium">{formatDate(driver.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
