import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Car, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

interface Booking {
    id: number;
    booking_code: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    car: {
        id: number;
        model: string;
        license_plate: string;
        brand: {
            name: string;
        };
    };
    pickup_datetime: string;
    return_datetime: string;
    pickup_location_id: number;
    return_location_id: number;
    with_driver: boolean;
    driver_profile_id: number | null;
    is_delivery: boolean;
    delivery_address: string | null;
    customer_notes: string | null;
    admin_notes: string | null;
}

interface Location {
    id: number;
    name: string;
    address: string;
    city: string;
}

interface DriverProfile {
    id: number;
    name: string;
    phone: string;
    license_number: string;
}

export default function AdminBookingEdit({
    booking,
    locations,
    drivers,
}: {
    booking: Booking;
    locations: Location[];
    drivers: DriverProfile[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Bookings', href: '/admin/bookings' },
        { title: booking.booking_code, href: `/admin/bookings/${booking.id}` },
        { title: 'Edit', href: `/admin/bookings/${booking.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        pickup_datetime: booking.pickup_datetime.slice(0, 16),
        return_datetime: booking.return_datetime.slice(0, 16),
        pickup_location_id: booking.pickup_location_id.toString(),
        return_location_id: booking.return_location_id.toString(),
        with_driver: booking.with_driver,
        driver_profile_id: booking.driver_profile_id?.toString() || '',
        is_delivery: booking.is_delivery,
        delivery_address: booking.delivery_address || '',
        admin_notes: booking.admin_notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/bookings/${booking.id}`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Booking ${booking.booking_code}`} />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/bookings/${booking.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Booking {booking.booking_code}
                        </h1>
                        <p className="text-muted-foreground">
                            Update booking details and settings
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left Column - Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Booking Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Booking Information
                                    </CardTitle>
                                    <CardDescription>
                                        Update rental dates and times
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="pickup_datetime">
                                                Pickup Date & Time <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="pickup_datetime"
                                                type="datetime-local"
                                                value={data.pickup_datetime}
                                                onChange={(e) => setData('pickup_datetime', e.target.value)}
                                                required
                                            />
                                            {errors.pickup_datetime && (
                                                <p className="text-sm text-destructive">{errors.pickup_datetime}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="return_datetime">
                                                Return Date & Time <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="return_datetime"
                                                type="datetime-local"
                                                value={data.return_datetime}
                                                onChange={(e) => setData('return_datetime', e.target.value)}
                                                required
                                            />
                                            {errors.return_datetime && (
                                                <p className="text-sm text-destructive">{errors.return_datetime}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Locations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Locations
                                    </CardTitle>
                                    <CardDescription>
                                        Pickup and return locations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="pickup_location_id">
                                                Pickup Location <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.pickup_location_id}
                                                onValueChange={(value) => setData('pickup_location_id', value)}
                                            >
                                                <SelectTrigger id="pickup_location_id">
                                                    <SelectValue placeholder="Select pickup location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name} - {location.city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.pickup_location_id && (
                                                <p className="text-sm text-destructive">{errors.pickup_location_id}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="return_location_id">
                                                Return Location <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.return_location_id}
                                                onValueChange={(value) => setData('return_location_id', value)}
                                            >
                                                <SelectTrigger id="return_location_id">
                                                    <SelectValue placeholder="Select return location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name} - {location.city}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.return_location_id && (
                                                <p className="text-sm text-destructive">{errors.return_location_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Driver Service */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Driver Service
                                    </CardTitle>
                                    <CardDescription>
                                        Add driver service to this booking
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="with_driver"
                                            checked={data.with_driver}
                                            onChange={(e) => {
                                                setData('with_driver', e.target.checked);
                                                if (!e.target.checked) {
                                                    setData('driver_profile_id', '');
                                                }
                                            }}
                                            className="h-4 w-4"
                                            aria-label="Include driver service"
                                        />
                                        <Label htmlFor="with_driver" className="cursor-pointer">
                                            Include driver service
                                        </Label>
                                    </div>

                                    {data.with_driver && (
                                        <div className="space-y-2">
                                            <Label htmlFor="driver_profile_id">
                                                Select Driver <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.driver_profile_id}
                                                onValueChange={(value) => setData('driver_profile_id', value)}
                                            >
                                                <SelectTrigger id="driver_profile_id">
                                                    <SelectValue placeholder="Select driver" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {drivers.map((driver) => (
                                                        <SelectItem key={driver.id} value={driver.id.toString()}>
                                                            {driver.name} - {driver.phone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.driver_profile_id && (
                                                <p className="text-sm text-destructive">{errors.driver_profile_id}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Delivery Service */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5" />
                                        Delivery Service
                                    </CardTitle>
                                    <CardDescription>
                                        Deliver the car to customer's address
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_delivery"
                                            checked={data.is_delivery}
                                            onChange={(e) => {
                                                setData('is_delivery', e.target.checked);
                                                if (!e.target.checked) {
                                                    setData('delivery_address', '');
                                                }
                                            }}
                                            className="h-4 w-4"
                                            aria-label="Enable delivery service"
                                        />
                                        <Label htmlFor="is_delivery" className="cursor-pointer">
                                            Enable delivery service
                                        </Label>
                                    </div>

                                    {data.is_delivery && (
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_address">
                                                Delivery Address <span className="text-destructive">*</span>
                                            </Label>
                                            <Textarea
                                                id="delivery_address"
                                                placeholder="Enter full delivery address..."
                                                value={data.delivery_address}
                                                onChange={(e) => setData('delivery_address', e.target.value)}
                                                rows={3}
                                            />
                                            {errors.delivery_address && (
                                                <p className="text-sm text-destructive">{errors.delivery_address}</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Admin Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Admin Notes</CardTitle>
                                    <CardDescription>
                                        Internal notes visible only to admins
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Textarea
                                        id="admin_notes"
                                        placeholder="Add internal notes about this booking..."
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                        rows={4}
                                    />
                                    {errors.admin_notes && (
                                        <p className="text-sm text-destructive">{errors.admin_notes}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-6">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Customer</CardTitle>
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
                                </CardContent>
                            </Card>

                            {/* Car Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Car</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="font-medium">
                                        {booking.car.brand.name} {booking.car.model}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {booking.car.license_plate}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Notes (Read-Only) */}
                            {booking.customer_notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Customer Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm bg-muted p-3 rounded-lg">
                                            {booking.customer_notes}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/admin/bookings/${booking.id}`}>
                                            Cancel
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
