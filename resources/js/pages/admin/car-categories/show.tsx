import { type CarCategory, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Edit, Shapes, Trash2 } from 'lucide-react';
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
import AdminLayout from '@/layouts/admin-layout';

const breadcrumbs = (category: CarCategory): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Car Categories',
        href: '/admin/car-categories',
    },
    {
        title: category.name,
        href: `/admin/car-categories/${category.id}`,
    },
];

export default function AdminCarCategoriesShow({ category }: { category: CarCategory }) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleToggleStatus = () => {
        router.post(`/admin/car-categories/${category.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const confirmDelete = () => {
        router.delete(`/admin/car-categories/${category.id}`, {
            onSuccess: () => router.visit('/admin/car-categories'),
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs(category)}>
            <Head title={category.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/car-categories">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
                            <p className="text-sm text-muted-foreground">Category details and information</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleToggleStatus}>
                            <Shapes className={`mr-2 h-4 w-4 ${category.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                            {category.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/car-categories/${category.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={category.cars_count! > 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Category Name</p>
                                        <p className="text-base font-medium">{category.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                        <p className="text-sm font-mono">{category.slug}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Icon</p>
                                        <Badge variant="outline" className="font-mono">{category.icon}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <Badge variant="outline" className={category.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sort Order</p>
                                        <p className="text-base">{category.sort_order}</p>
                                    </div>
                                </div>
                                {category.description && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                                        <p className="text-base">{category.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Cars</p>
                                        <p className="text-2xl font-bold">{category.cars_count || 0}</p>
                                    </div>
                                    <Shapes className="h-8 w-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Category ID</p>
                                    <p className="text-sm font-mono">#{category.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                    <p className="text-base">{new Date(category.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-base">{new Date(category.updated_at).toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                        {category.cars_count! > 0 && (
                            <Card className="bg-yellow-50 border-yellow-200">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This category has {category.cars_count} car{category.cars_count !== 1 ? 's' : ''} and cannot be deleted.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
