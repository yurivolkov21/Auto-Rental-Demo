import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Car,
    CheckCircle,
    Clock,
    CreditCard,
    Edit,
    FileText,
    MapPin,
    Phone,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

interface Booking {
    id: number;
    booking_code: string;
    status: string;
    pickup_datetime: string;
    return_datetime: string;
    pickup_location: {
        id: number;
        name: string;
        address: string;
        city: string;
    };
    return_location: {
        id: number;
        name: string;
        address: string;
        city: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
    car: {
        id: number;
        model: string;
        license_plate: string;
        year: number;
        brand: {
            name: string;
        };
        category: {
            name: string;
        };
        images: Array<{
            id: number;
            image_url: string;
            is_primary: boolean;
        }>;
    };
    driver_profile: {
        id: number;
        name: string;
        phone: string;
        license_number: string;
    } | null;
    charge: {
        base_rate_per_day: string;
        number_of_days: number;
        subtotal: string;
        driver_fee: string;
        delivery_fee: string;
        extra_fees: string;
        discount_amount: string;
        total_amount: string;
        amount_paid: string;
        balance_due: string;
        extra_fee_notes: string | null;
    };
    with_driver: boolean;
    is_delivery: boolean;
    delivery_address: string | null;
    customer_notes: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

export default function AdminBookingShow({ booking }: { booking: Booking }) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showActivateDialog, setShowActivateDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const completeForm = useForm({
        extra_fees: '0',
        extra_fee_notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Bookings', href: '/admin/bookings' },
        { title: booking.booking_code, href: `/admin/bookings/${booking.id}` },
    ];

    const formatCurrency = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle },
            active: { color: 'bg-green-100 text-green-800 border-green-200', icon: Car },
            completed: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
            rejected: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color} text-base px-3 py-1`}>
                <Icon className="mr-2 h-4 w-4" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handleConfirm = () => {
        router.post(`/admin/bookings/${booking.id}/confirm`, {}, {
            onSuccess: () => setShowConfirmDialog(false),
        });
    };

    const handleReject = () => {
        router.post(`/admin/bookings/${booking.id}/reject`, {}, {
            onSuccess: () => setShowRejectDialog(false),
        });
    };

    const handleActivate = () => {
        router.post(`/admin/bookings/${booking.id}/activate`, {}, {
            onSuccess: () => setShowActivateDialog(false),
        });
    };

    const handleComplete = () => {
        completeForm.post(`/admin/bookings/${booking.id}/complete`, {
            onSuccess: () => setShowCompleteDialog(false),
        });
    };

    const handleDelete = () => {
        router.delete(`/admin/bookings/${booking.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                router.visit('/admin/bookings');
            },
        });
    };

    const primaryImage = booking.car.images.find((img) => img.is_primary) || booking.car.images[0];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Booking ${booking.booking_code}`} />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Booking {booking.booking_code}
                            </h1>
                            {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-muted-foreground">
                            Created on {formatDate(booking.created_at)}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {booking.status === 'pending' && (
                            <>
                                <Button variant="outline" onClick={() => setShowRejectDialog(true)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                </Button>
                                <Button onClick={() => setShowConfirmDialog(true)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirm
                                </Button>
                            </>
                        )}
                        {booking.status === 'confirmed' && (
                            <Button onClick={() => setShowActivateDialog(true)}>
                                <Car className="mr-2 h-4 w-4" />
                                Activate Rental
                            </Button>
                        )}
                        {booking.status === 'active' && (
                            <Button onClick={() => setShowCompleteDialog(true)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Rental
                            </Button>
                        )}
                        {booking.status === 'pending' && (
                            <Button variant="outline" asChild>
                                <Link href={`/admin/bookings/${booking.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {['cancelled', 'rejected'].includes(booking.status) && (
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Booking Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Booking Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Pickup Date</Label>
                                        <div className="font-medium">{formatDate(booking.pickup_datetime)}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Return Date</Label>
                                        <div className="font-medium">{formatDate(booking.return_datetime)}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Pickup Location</Label>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{booking.pickup_location.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {booking.pickup_location.address}, {booking.pickup_location.city}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Return Location</Label>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{booking.return_location.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {booking.return_location.address}, {booking.return_location.city}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex items-center gap-4">
                                        <Badge variant="outline" className={booking.with_driver ? 'bg-blue-50' : ''}>
                                            <User className="mr-1 h-3 w-3" />
                                            {booking.with_driver ? 'With Driver' : 'Self Drive'}
                                        </Badge>
                                        <Badge variant="outline" className={booking.is_delivery ? 'bg-purple-50' : ''}>
                                            <Car className="mr-1 h-3 w-3" />
                                            {booking.is_delivery ? 'Delivery Service' : 'Pickup at Location'}
                                        </Badge>
                                    </div>
                                </div>

                                {booking.is_delivery && booking.delivery_address && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Delivery Address</Label>
                                        <div className="font-medium">{booking.delivery_address}</div>
                                    </div>
                                )}

                                {booking.customer_notes && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Customer Notes</Label>
                                        <div className="text-sm bg-muted p-3 rounded-lg">{booking.customer_notes}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Car Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="h-5 w-5" />
                                    Car Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    {primaryImage && (
                                        <img
                                            src={primaryImage.image_url}
                                            alt={booking.car.model}
                                            className="w-48 h-32 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <div className="text-xl font-bold">
                                                {booking.car.brand.name} {booking.car.model}
                                            </div>
                                            <div className="text-muted-foreground">{booking.car.year}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">{booking.car.license_plate}</Badge>
                                            <Badge variant="outline">{booking.car.category.name}</Badge>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/cars/${booking.car.id}`}>
                                                View Car Details
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Driver Information */}
                        {booking.with_driver && booking.driver_profile && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Driver Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Driver Name</Label>
                                        <div className="font-medium">{booking.driver_profile.name}</div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Phone</Label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{booking.driver_profile.phone}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">License Number</Label>
                                            <div className="font-medium">{booking.driver_profile.license_number}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Admin Notes */}
                        {booking.admin_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Admin Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-blue-50 p-3 rounded-lg text-sm">{booking.admin_notes}</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Name</Label>
                                    <div className="font-medium">{booking.user.name}</div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground">Email</Label>
                                    <div className="text-sm">{booking.user.email}</div>
                                </div>
                                {booking.user.phone && (
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Phone</Label>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{booking.user.phone}</span>
                                        </div>
                                    </div>
                                )}
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <Link href={`/admin/users/${booking.user.id}`}>
                                        View Customer Profile
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pricing Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Base Rate ({booking.charge.number_of_days} days)
                                    </span>
                                    <span className="font-medium">{formatCurrency(booking.charge.subtotal)}</span>
                                </div>
                                {parseFloat(booking.charge.driver_fee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Driver Fee</span>
                                        <span className="font-medium">{formatCurrency(booking.charge.driver_fee)}</span>
                                    </div>
                                )}
                                {parseFloat(booking.charge.delivery_fee) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Delivery Fee</span>
                                        <span className="font-medium">{formatCurrency(booking.charge.delivery_fee)}</span>
                                    </div>
                                )}
                                {parseFloat(booking.charge.extra_fees) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Extra Fees</span>
                                        <span className="font-medium text-orange-600">
                                            {formatCurrency(booking.charge.extra_fees)}
                                        </span>
                                    </div>
                                )}
                                {booking.charge.extra_fee_notes && (
                                    <div className="text-xs text-muted-foreground bg-orange-50 p-2 rounded">
                                        {booking.charge.extra_fee_notes}
                                    </div>
                                )}
                                {parseFloat(booking.charge.discount_amount) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="font-medium text-green-600">
                                            -{formatCurrency(booking.charge.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Amount</span>
                                        <span>{formatCurrency(booking.charge.total_amount)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount Paid</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(booking.charge.amount_paid)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Balance Due</span>
                                        <span className={`font-medium ${parseFloat(booking.charge.balance_due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(booking.charge.balance_due)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">Booking Created</div>
                                            <div className="text-xs text-muted-foreground">
                                                {formatDate(booking.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                    {booking.status !== 'pending' && (
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">Status Updated</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(booking.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to confirm this booking? The customer will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm}>
                            Confirm Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to reject this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Reject Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Activate Dialog */}
            <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Activate Rental</DialogTitle>
                        <DialogDescription>
                            Mark this booking as active (car has been picked up by customer).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowActivateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleActivate}>
                            Activate Rental
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Complete Dialog */}
            <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Rental</DialogTitle>
                        <DialogDescription>
                            Mark this rental as completed. Add any extra fees if applicable.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="extra_fees">Extra Fees (VND)</Label>
                            <Input
                                id="extra_fees"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={completeForm.data.extra_fees}
                                onChange={(e) => completeForm.setData('extra_fees', e.target.value)}
                            />
                            {completeForm.errors.extra_fees && (
                                <p className="text-sm text-destructive">{completeForm.errors.extra_fees}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="extra_fee_notes">Notes (optional)</Label>
                            <Textarea
                                id="extra_fee_notes"
                                placeholder="e.g., Fuel charges, cleaning fees, damage costs..."
                                value={completeForm.data.extra_fee_notes}
                                onChange={(e) => completeForm.setData('extra_fee_notes', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleComplete} disabled={completeForm.processing}>
                            Complete Rental
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete this booking? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
