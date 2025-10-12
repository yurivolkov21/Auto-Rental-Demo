import { type Car, type CarImage, type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, FormEventHandler } from 'react';
import AdminLayout from '@/layouts/admin-layout';
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
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    Upload,
    Image as ImageIcon,
    Star,
    Trash2,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';

interface ImagesPageProps {
    car: Car;
}

export default function CarImages({ car }: ImagesPageProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<CarImage | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Cars', href: '/admin/cars' },
        { title: `${car.brand?.name} ${car.model}`, href: `/admin/cars/${car.id}` },
        { title: 'Images', href: `/admin/cars/${car.id}/images` },
    ];

    const images = car.images || [];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Validate file types
        const validFiles = files.filter((file) => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            return validTypes.includes(file.type);
        });

        if (validFiles.length !== files.length) {
            alert('Some files were skipped. Only JPEG, PNG, and WebP images are allowed.');
        }

        // Create preview URLs
        const urls = validFiles.map((file) => URL.createObjectURL(file));
        setSelectedFiles(validFiles);
        setPreviewUrls(urls);
    };

    const handleUpload: FormEventHandler = (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) return;

        setUploading(true);

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('images[]', file);
        });

        router.post(`/admin/cars/${car.id}/images`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                // Clean up
                setSelectedFiles([]);
                setPreviewUrls([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setUploading(false);
            },
            onError: () => {
                setUploading(false);
            },
        });
    };

    const handleSetPrimary = (image: CarImage) => {
        router.patch(`/admin/cars/${car.id}/images/${image.id}/set-primary`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteClick = (image: CarImage) => {
        setImageToDelete(image);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!imageToDelete) return;

        router.delete(`/admin/cars/${car.id}/images/${imageToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setImageToDelete(null);
            },
        });
    };

    const handleMoveUp = (image: CarImage, currentIndex: number) => {
        if (currentIndex === 0) return;

        const newImages = [...images];
        const temp = newImages[currentIndex - 1];
        newImages[currentIndex - 1] = newImages[currentIndex];
        newImages[currentIndex] = temp;

        // Update sort_order for all images
        const reorderedImages = newImages.map((img, index) => ({
            id: img.id,
            sort_order: index,
        }));

        router.post(`/admin/cars/${car.id}/images/reorder`, {
            images: reorderedImages,
        }, {
            preserveScroll: true,
        });
    };

    const handleMoveDown = (image: CarImage, currentIndex: number) => {
        if (currentIndex === images.length - 1) return;

        const newImages = [...images];
        const temp = newImages[currentIndex + 1];
        newImages[currentIndex + 1] = newImages[currentIndex];
        newImages[currentIndex] = temp;

        // Update sort_order for all images
        const reorderedImages = newImages.map((img, index) => ({
            id: img.id,
            sort_order: index,
        }));

        router.post(`/admin/cars/${car.id}/images/reorder`, {
            images: reorderedImages,
        }, {
            preserveScroll: true,
        });
    };

    const cancelUpload = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage Images - ${car.brand?.name} ${car.model}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/cars/${car.id}`}>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Manage Car Images</h1>
                            <p className="text-sm text-muted-foreground">
                                {car.brand?.name} {car.model} ({images.length} images)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload New Images
                        </CardTitle>
                        <CardDescription>
                            Select multiple images to upload. Accepted formats: JPEG, PNG, WebP (max 5MB each)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Click to select images or drag and drop
                                </p>
                            </label>
                        </div>

                        {/* Preview Selected Images */}
                        {selectedFiles.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                        {selectedFiles.length} file(s) selected
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={cancelUpload}>
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={handleUpload} disabled={uploading}>
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload {selectedFiles.length} image(s)
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Existing Images */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5" />
                            Current Images ({images.length})
                        </CardTitle>
                        <CardDescription>
                            Manage existing car images. Set primary image, reorder, or delete.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No images yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Upload your first image to get started
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {images.map((image, index) => (
                                    <Card key={image.id} className="overflow-hidden">
                                        <div className="relative aspect-video">
                                            <img
                                                src={image.url}
                                                alt={image.alt_text || `Car image ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {image.is_primary && (
                                                <Badge className="absolute top-2 right-2 bg-green-500">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Primary
                                                </Badge>
                                            )}
                                        </div>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>Position: {index + 1}</span>
                                                {image.is_primary && (
                                                    <span className="text-green-600 font-medium">★ Primary</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                {!image.is_primary && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSetPrimary(image)}
                                                        className="flex-1"
                                                    >
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Set Primary
                                                    </Button>
                                                )}
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleMoveUp(image, index)}
                                                        disabled={index === 0}
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleMoveDown(image, index)}
                                                        disabled={index === images.length - 1}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(image)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Image</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this image? This action cannot be undone.
                            {imageToDelete?.is_primary && (
                                <span className="block mt-2 text-yellow-600 font-medium">
                                    ⚠️ This is the primary image. Another image will be automatically set as primary.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
