import { type CarBrand, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, ChevronLeft, Edit, Trash2 } from 'lucide-react';
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
import AdminLayout from '@/layouts/admin-layout';

const breadcrumbs = (brand: CarBrand): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Car Brands',
        href: '/admin/car-brands',
    },
    {
        title: brand.name,
        href: `/admin/car-brands/${brand.id}`,
    },
];

export default function AdminCarBrandsShow({ brand }: { brand: CarBrand }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleToggleStatus = () => {
        router.post(`/admin/car-brands/${brand.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/car-brands/${brand.id}`, {
            onSuccess: () => {
                router.visit('/admin/car-brands');
            },
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs(brand)}>
            <Head title={brand.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/car-brands">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {brand.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Brand details and information
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleToggleStatus}>
                            <BadgeCheck
                                className={`mr-2 h-4 w-4 ${
                                    brand.is_active ? 'text-green-600' : 'text-gray-400'
                                }`}
                            />
                            {brand.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/car-brands/${brand.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={brand.cars_count! > 0}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Information</CardTitle>
                                <CardDescription>
                                    Basic details about this brand
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Brand Name
                                        </p>
                                        <p className="text-base font-medium">{brand.name}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Slug
                                        </p>
                                        <p className="text-sm font-mono">
                                            {brand.slug}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                brand.is_active
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }
                                        >
                                            {brand.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Sort Order
                                        </p>
                                        <p className="text-base">{brand.sort_order}</p>
                                    </div>
                                </div>

                                {brand.logo && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">
                                            Logo URL
                                        </p>
                                        <a
                                            href={brand.logo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm break-all"
                                        >
                                            {brand.logo}
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                                <CardDescription>
                                    Usage statistics for this brand
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Total Cars
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {brand.cars_count || 0}
                                        </p>
                                    </div>
                                    <BadgeCheck className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                                <CardDescription>
                                    System information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Brand ID
                                    </p>
                                    <p className="text-sm font-mono">
                                        #{brand.id}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Created At
                                    </p>
                                    <p className="text-base">
                                        {new Date(brand.created_at).toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Last Updated
                                    </p>
                                    <p className="text-base">
                                        {new Date(brand.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {brand.cars_count! > 0 && (
                            <Card className="bg-yellow-50 border-yellow-200">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This brand has {brand.cars_count} car{brand.cars_count !== 1 ? 's' : ''} associated with it and cannot be deleted.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Brand</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{brand.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
