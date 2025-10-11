import { type BreadcrumbItem, type Location } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    location: Location;
}

export default function AdminLocationsEdit({ location }: Props) {
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
            href: `/admin/locations/${location.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: location.name,
        slug: location.slug,
        description: location.description || '',
        address: location.address || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        phone: location.phone || '',
        email: location.email || '',
        opening_time: location.opening_time || '08:00:00',
        closing_time: location.closing_time || '18:00:00',
        is_24_7: location.is_24_7,
        is_airport: location.is_airport,
        is_popular: location.is_popular,
        is_active: location.is_active,
        sort_order: location.sort_order || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/locations/${location.id}`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${location.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/locations">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Location
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Update {location.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Enter the location's basic details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Ho Chi Minh City Center"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="slug">
                                                Slug <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="slug"
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                placeholder="e.g., ho-chi-minh-city-center"
                                                className={errors.slug ? 'border-red-500' : ''}
                                            />
                                            {errors.slug && (
                                                <p className="text-sm text-red-500">{errors.slug}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of the location..."
                                            rows={3}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">
                                            Address <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="address"
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Full address..."
                                            rows={2}
                                            className={errors.address ? 'border-red-500' : ''}
                                        />
                                        {errors.address && (
                                            <p className="text-sm text-red-500">{errors.address}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Coordinates</CardTitle>
                                    <CardDescription>
                                        Specify the location's geographic coordinates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="latitude">
                                                Latitude <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="latitude"
                                                type="number"
                                                step="any"
                                                value={data.latitude}
                                                onChange={(e) => setData('latitude', e.target.value)}
                                                placeholder="e.g., 10.7769"
                                                className={errors.latitude ? 'border-red-500' : ''}
                                            />
                                            {errors.latitude && (
                                                <p className="text-sm text-red-500">{errors.latitude}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="longitude">
                                                Longitude <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="longitude"
                                                type="number"
                                                step="any"
                                                value={data.longitude}
                                                onChange={(e) => setData('longitude', e.target.value)}
                                                placeholder="e.g., 106.7009"
                                                className={errors.longitude ? 'border-red-500' : ''}
                                            />
                                            {errors.longitude && (
                                                <p className="text-sm text-red-500">{errors.longitude}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                    <CardDescription>
                                        Location contact details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone || ''}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="e.g., +84 123 456 789"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email || ''}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="e.g., contact@location.com"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Operating Hours</CardTitle>
                                    <CardDescription>
                                        Set the location's business hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_24_7"
                                            checked={data.is_24_7}
                                            onCheckedChange={(checked) => setData('is_24_7', checked as boolean)}
                                        />
                                        <Label htmlFor="is_24_7" className="cursor-pointer">
                                            Open 24/7
                                        </Label>
                                    </div>

                                    {!data.is_24_7 && (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="opening_time">
                                                    Opening Time <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="opening_time"
                                                    type="time"
                                                    value={data.opening_time.substring(0, 5)}
                                                    onChange={(e) => setData('opening_time', e.target.value + ':00')}
                                                    className={errors.opening_time ? 'border-red-500' : ''}
                                                />
                                                {errors.opening_time && (
                                                    <p className="text-sm text-red-500">{errors.opening_time}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="closing_time">
                                                    Closing Time <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="closing_time"
                                                    type="time"
                                                    value={data.closing_time.substring(0, 5)}
                                                    onChange={(e) => setData('closing_time', e.target.value + ':00')}
                                                    className={errors.closing_time ? 'border-red-500' : ''}
                                                />
                                                {errors.closing_time && (
                                                    <p className="text-sm text-red-500">{errors.closing_time}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>
                                        Configure location properties
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_airport"
                                            checked={data.is_airport}
                                            onCheckedChange={(checked) => setData('is_airport', checked as boolean)}
                                        />
                                        <Label htmlFor="is_airport" className="cursor-pointer">
                                            Airport Location
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_popular"
                                            checked={data.is_popular}
                                            onCheckedChange={(checked) => setData('is_popular', checked as boolean)}
                                        />
                                        <Label htmlFor="is_popular" className="cursor-pointer">
                                            Popular Location
                                        </Label>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sort_order">Sort Order</Label>
                                        <Input
                                            id="sort_order"
                                            type="number"
                                            value={data.sort_order}
                                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                            className={errors.sort_order ? 'border-red-500' : ''}
                                        />
                                        {errors.sort_order && (
                                            <p className="text-sm text-red-500">{errors.sort_order}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Update Location
                                            </>
                                        )}
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
