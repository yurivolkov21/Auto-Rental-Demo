import { type Location, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Check,
    ChevronLeft,
    Clock,
    Edit,
    Globe,
    Mail,
    MapPin,
    Phone,
    Plane,
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
    location: Location;
}

export default function AdminLocationsShow({ location }: Props) {
    const [toggleDialogOpen, setToggleDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin',
        },
        {
            title: 'Locations',
            href: '/admin/locations',
        },
        {
            title: location.name,
            href: `/admin/locations/${location.id}`,
        },
    ];

    const handleToggleStatus = () => {
        router.post(
            `/admin/locations/${location.id}/toggle-status`,
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

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${location.name} - Location Details`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/locations">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {location.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Location details and management
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setToggleDialogOpen(true)}
                        >
                            {location.is_active ? (
                                <>
                                    <X className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/locations/${location.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
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
                                <div className="flex gap-2">
                                    <Badge
                                        variant={location.is_active ? 'default' : 'secondary'}
                                        className={
                                            location.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }
                                    >
                                        {location.is_active ? (
                                            <>
                                                <Check className="mr-1 h-3 w-3" />
                                                Active
                                            </>
                                        ) : (
                                            <>
                                                <X className="mr-1 h-3 w-3" />
                                                Inactive
                                            </>
                                        )}
                                    </Badge>

                                    {location.is_airport && (
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                            <Plane className="mr-1 h-3 w-3" />
                                            Airport
                                        </Badge>
                                    )}

                                    {location.is_popular && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                            <Star className="mr-1 h-3 w-3" />
                                            Popular
                                        </Badge>
                                    )}

                                    {location.is_24_7 && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            <Clock className="mr-1 h-3 w-3" />
                                            24/7
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Information</CardTitle>
                                <CardDescription>
                                    Basic details about this location
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                                            <p className="text-sm">{location.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {location.description && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                            <p className="text-sm">{location.description}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Latitude</p>
                                        <p className="text-sm font-mono">{location.latitude || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Longitude</p>
                                        <p className="text-sm font-mono">{location.longitude || 'N/A'}</p>
                                    </div>
                                </div>

                                {(location.latitude && location.longitude) && (
                                    <div>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Globe className="mr-2 h-4 w-4" />
                                                View on Google Maps
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>
                                    How to reach this location
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {location.phone ? (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                            <a href={`tel:${location.phone}`} className="text-sm text-blue-600 hover:underline">
                                                {location.phone}
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                            <p className="text-sm text-muted-foreground">Not provided</p>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {location.email ? (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <a href={`mailto:${location.email}`} className="text-sm text-blue-600 hover:underline">
                                                {location.email}
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="text-sm text-muted-foreground">Not provided</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Operating Hours */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Operating Hours</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {location.is_24_7 ? (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Open 24/7</p>
                                            <p className="text-sm text-muted-foreground">
                                                Available anytime
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Opening Time</p>
                                                <p className="text-sm font-medium">{location.opening_time || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Closing Time</p>
                                                <p className="text-sm font-medium">{location.closing_time || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Meta Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Meta Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                    <p className="text-sm font-mono">{location.slug}</p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sort Order</p>
                                    <p className="text-sm">{location.sort_order || 0}</p>
                                </div>

                                {location.created_at && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Created</p>
                                            <p className="text-sm">{new Date(location.created_at).toLocaleString()}</p>
                                        </div>
                                    </>
                                )}

                                {location.updated_at && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                            <p className="text-sm">{new Date(location.updated_at).toLocaleString()}</p>
                                        </div>
                                    </>
                                )}
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
                            {location.is_active ? 'Deactivate' : 'Activate'} Location
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {location.is_active ? 'deactivate' : 'activate'}{' '}
                            <strong>{location.name}</strong>?
                            {location.is_active && (
                                <span className="block mt-2 text-yellow-600">
                                    Deactivating this location will make it unavailable for new bookings.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setToggleDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleToggleStatus}>
                            {location.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
