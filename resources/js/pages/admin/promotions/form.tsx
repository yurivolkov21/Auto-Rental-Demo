import { type Promotion, type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, DollarSign, Loader2, Percent, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';

const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AdminPromotionsForm({
    promotion,
    isEditing,
}: {
    promotion: Promotion | null;
    isEditing: boolean;
}) {
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
            title: isEditing ? 'Edit' : 'Create',
            href: isEditing ? `/admin/promotions/${promotion?.id}/edit` : '/admin/promotions/create',
        },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        code: promotion?.code || '',
        name: promotion?.name || '',
        description: promotion?.description || '',
        discount_type: promotion?.discount_type || 'percentage',
        discount_value: promotion?.discount_value || '',
        max_discount: promotion?.max_discount || '',
        min_amount: promotion?.min_amount || '0',
        min_rental_hours: promotion?.min_rental_hours || 4,
        max_uses: promotion?.max_uses || '',
        max_uses_per_user: promotion?.max_uses_per_user || 1,
        start_date: promotion?.start_date
            ? formatDateTimeLocal(promotion.start_date)
            : formatDateTimeLocal(new Date().toISOString()),
        end_date: promotion?.end_date
            ? formatDateTimeLocal(promotion.end_date)
            : formatDateTimeLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
        status: promotion?.status || 'active',
        is_auto_apply: promotion?.is_auto_apply || false,
        is_featured: promotion?.is_featured || false,
        priority: promotion?.priority || 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && promotion) {
            put(`/admin/promotions/${promotion.id}`);
        } else {
            post('/admin/promotions');
        }
    };

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(num);
    };

    const calculatePreviewDiscount = () => {
        const rentalAmount = 2000000; // Example: 2M VND
        const discountValue = parseFloat(data.discount_value) || 0;
        const maxDiscount = parseFloat(data.max_discount) || 0;

        if (data.discount_type === 'percentage') {
            const discount = (rentalAmount * discountValue) / 100;
            const finalDiscount = maxDiscount > 0 ? Math.min(discount, maxDiscount) : discount;
            return {
                amount: finalDiscount,
                finalPrice: rentalAmount - finalDiscount,
            };
        }

        const finalDiscount = Math.min(discountValue, rentalAmount);
        return {
            amount: finalDiscount,
            finalPrice: rentalAmount - finalDiscount,
        };
    };

    const preview = calculatePreviewDiscount();

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Promotion' : 'Create Promotion'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/promotions">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit Promotion' : 'Create Promotion'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isEditing
                                ? 'Update promotion details'
                                : 'Add a new promotional offer'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Enter the promotion code and name
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="code">
                                                Promotion Code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                value={data.code}
                                                onChange={(e) =>
                                                    setData('code', e.target.value.toUpperCase())
                                                }
                                                placeholder="e.g., WELCOME10"
                                                className={errors.code ? 'border-red-500' : ''}
                                                maxLength={20}
                                            />
                                            {errors.code && (
                                                <p className="text-sm text-red-500">{errors.code}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Unique code customers will use
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="name">
                                                Promotion Name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Welcome New Customer"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">{errors.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Optional description for internal reference"
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discount Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Discount Configuration</CardTitle>
                                    <CardDescription>
                                        Set the discount type and value
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discount_type">
                                            Discount Type <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.discount_type}
                                            onValueChange={(value: 'percentage' | 'fixed_amount') =>
                                                setData('discount_type', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    <div className="flex items-center">
                                                        <Percent className="inline h-4 w-4 mr-2" />
                                                        Percentage Discount
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="fixed_amount">
                                                    <div className="flex items-center">
                                                        <DollarSign className="inline h-4 w-4 mr-2" />
                                                        Fixed Amount Discount
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="discount_value">
                                                Discount Value <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="discount_value"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.discount_value}
                                                onChange={(e) =>
                                                    setData('discount_value', e.target.value)
                                                }
                                                placeholder={
                                                    data.discount_type === 'percentage' ? '10' : '50000'
                                                }
                                                className={errors.discount_value ? 'border-red-500' : ''}
                                            />
                                            {errors.discount_value && (
                                                <p className="text-sm text-red-500">
                                                    {errors.discount_value}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {data.discount_type === 'percentage'
                                                    ? 'Enter percentage (e.g., 10 for 10%)'
                                                    : 'Enter amount in VND (e.g., 50000)'}
                                            </p>
                                        </div>

                                        {data.discount_type === 'percentage' && (
                                            <div className="space-y-2">
                                                <Label htmlFor="max_discount">
                                                    Max Discount Amount (VND)
                                                </Label>
                                                <Input
                                                    id="max_discount"
                                                    type="number"
                                                    step="1"
                                                    min="0"
                                                    value={data.max_discount}
                                                    onChange={(e) =>
                                                        setData('max_discount', e.target.value)
                                                    }
                                                    placeholder="200000"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Optional cap for percentage discounts
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
                                        Set minimum requirements to use this promotion
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="min_amount">
                                                Minimum Rental Amount (VND)
                                            </Label>
                                            <Input
                                                id="min_amount"
                                                type="number"
                                                step="1"
                                                min="0"
                                                value={data.min_amount}
                                                onChange={(e) => setData('min_amount', e.target.value)}
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                0 means no minimum requirement
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="min_rental_hours">
                                                Minimum Rental Hours
                                            </Label>
                                            <Input
                                                id="min_rental_hours"
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={data.min_rental_hours}
                                                onChange={(e) =>
                                                    setData('min_rental_hours', parseInt(e.target.value) || 4)
                                                }
                                                placeholder="4"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Minimum hours to qualify
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Usage Limits */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Limits</CardTitle>
                                    <CardDescription>
                                        Control how many times this promotion can be used
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="max_uses">Total Usage Limit</Label>
                                            <Input
                                                id="max_uses"
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={data.max_uses}
                                                onChange={(e) => setData('max_uses', e.target.value)}
                                                placeholder="Leave empty for unlimited"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Total times this code can be used
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_uses_per_user">
                                                Per User Limit <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="max_uses_per_user"
                                                type="number"
                                                step="1"
                                                min="1"
                                                value={data.max_uses_per_user}
                                                onChange={(e) =>
                                                    setData(
                                                        'max_uses_per_user',
                                                        parseInt(e.target.value) || 1
                                                    )
                                                }
                                                placeholder="1"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Times each user can use this code
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Validity Period */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Validity Period</CardTitle>
                                    <CardDescription>
                                        Set the active date range for this promotion
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">
                                                Start Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="start_date"
                                                type="datetime-local"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={errors.start_date ? 'border-red-500' : ''}
                                            />
                                            {errors.start_date && (
                                                <p className="text-sm text-red-500">
                                                    {errors.start_date}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">
                                                End Date <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="end_date"
                                                type="datetime-local"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className={errors.end_date ? 'border-red-500' : ''}
                                            />
                                            {errors.end_date && (
                                                <p className="text-sm text-red-500">{errors.end_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                    <CardDescription>
                                        Configure promotion settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">
                                            Status <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value: 'active' | 'paused' | 'upcoming') =>
                                                setData('status', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="paused">Paused</SelectItem>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Input
                                            id="priority"
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={data.priority}
                                            onChange={(e) =>
                                                setData('priority', parseInt(e.target.value) || 0)
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Lower number = higher priority (0 is highest)
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_featured"
                                                checked={data.is_featured}
                                                onCheckedChange={(checked) =>
                                                    setData('is_featured', checked as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor="is_featured"
                                                className="font-normal cursor-pointer"
                                            >
                                                Featured Promotion
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-6">
                                            Display on homepage and promotional banners
                                        </p>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_auto_apply"
                                                checked={data.is_auto_apply}
                                                onCheckedChange={(checked) =>
                                                    setData('is_auto_apply', checked as boolean)
                                                }
                                            />
                                            <Label
                                                htmlFor="is_auto_apply"
                                                className="font-normal cursor-pointer"
                                            >
                                                Auto-apply
                                            </Label>
                                        </div>
                                        <p className="text-xs text-muted-foreground ml-6">
                                            Automatically apply without requiring code input
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Discount Preview</CardTitle>
                                    <CardDescription>
                                        Example calculation for 2,000,000 ₫ rental
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Original Price:</span>
                                        <span className="font-medium">2,000,000 ₫</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Discount:</span>
                                        <span className="font-semibold text-green-600">
                                            -{formatCurrency(preview.amount)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Final Price:</span>
                                            <span className="text-lg font-bold">
                                                {formatCurrency(preview.finalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <Card>
                                <CardContent className="pt-6 space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {isEditing ? 'Update Promotion' : 'Create Promotion'}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => router.get('/admin/promotions')}
                                        disabled={processing}
                                    >
                                        Cancel
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
