import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Edit,
    Trash2,
    ToggleLeft,
    CheckCircle,
    XCircle,
    Car as CarIcon,
    MapPin,
    User,
    FileText,
    Wrench,
    DollarSign,
    TrendingUp,
    Star,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { type Car, type BreadcrumbItem } from '@/types';

interface ShowProps {
    car: Car;
}

export default function Show({ car }: ShowProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Cars', href: '/admin/cars' },
        { title: `${car.brand?.name} ${car.model}`, href: `/admin/cars/${car.id}` },
    ];

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isExpiringSoon = (dateString: string | null | undefined) => {
        if (!dateString) return false;
        const expiryDate = new Date(dateString);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    };

    const isExpired = (dateString: string | null | undefined) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    const needsMaintenance = car.next_maintenance_km && car.next_maintenance_km <= car.odometer_km;

    const handleDelete = () => {
        setDeleting(true);
        router.delete(`/admin/cars/${car.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteDialogOpen(false);
            },
        });
    };

    const handleToggleStatus = () => {
        router.post(`/admin/cars/${car.id}/toggle-status`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            available: 'bg-green-100 text-green-800',
            rented: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            inactive: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={styles[status as keyof typeof styles] || styles.inactive}>{status}</Badge>;
    };

    const getTransmissionBadge = (transmission: string) => {
        const styles = {
            automatic: 'bg-blue-50 text-blue-700 border-blue-200',
            manual: 'bg-gray-50 text-gray-700 border-gray-200',
        };
        return (
            <Badge variant="outline" className={styles[transmission as keyof typeof styles]}>
                {transmission}
            </Badge>
        );
    };

    const getFuelTypeBadge = (fuelType: string) => {
        const styles = {
            petrol: 'bg-orange-50 text-orange-700 border-orange-200',
            diesel: 'bg-gray-50 text-gray-700 border-gray-200',
            electric: 'bg-green-50 text-green-700 border-green-200',
            hybrid: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return (
            <Badge variant="outline" className={styles[fuelType as keyof typeof styles]}>
                {fuelType}
            </Badge>
        );
    };

    const images = car.images || [];
    const currentImage = images[currentImageIndex];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Handle both array format ["gps", "bluetooth"] and object format {"gps": true, "bluetooth": true}
    const features = car.features 
        ? (Array.isArray(car.features) 
            ? car.features 
            : Object.keys(car.features).filter(key => car.features?.[key]))
        : [];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${car.brand?.name} ${car.model} - ${car.year}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/cars">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {car.brand?.name} {car.model}
                                </h1>
                                {getStatusBadge(car.status)}
                                {car.is_verified && (
                                    <Badge className="bg-green-100 text-green-800">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {car.year} • {car.license_plate}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleToggleStatus}>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Toggle Status
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/cars/${car.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - 2/3 width */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        {images.length > 0 && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                        <img
                                            src={currentImage?.url}
                                            alt={currentImage?.alt_text || `${car.brand?.name} ${car.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                    onClick={prevImage}
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                    onClick={nextImage}
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </Button>
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                                                    {currentImageIndex + 1} / {images.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {images.length > 1 && (
                                        <div className="flex gap-2 mt-4 overflow-x-auto">
                                            {images.map((image, index) => (
                                                <button
                                                    key={image.id}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                                                        index === currentImageIndex ? 'ring-2 ring-primary' : ''
                                                    }`}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.alt_text || ''}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {image.is_primary && (
                                                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                                                            Primary
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Vehicle Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CarIcon className="h-5 w-5" />
                                    Vehicle Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brand</p>
                                        <p className="font-medium">{car.brand?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Model</p>
                                        <p className="font-medium">{car.model}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Year</p>
                                        <p className="font-medium">{car.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Color</p>
                                        <p className="font-medium">{car.color}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">License Plate</p>
                                        <p className="font-medium">{car.license_plate}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">VIN</p>
                                        <p className="font-medium">{car.vin || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Seats</p>
                                        <p className="font-medium">{car.seats}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="font-medium">{car.category?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transmission</p>
                                        <p className="font-medium">{getTransmissionBadge(car.transmission)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                                        <p className="font-medium">{getFuelTypeBadge(car.fuel_type)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Owner Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Owner Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{car.owner?.name}</p>
                                        <p className="text-sm text-muted-foreground">{car.owner?.email}</p>
                                        {car.owner?.phone && (
                                            <p className="text-sm text-muted-foreground">{car.owner.phone}</p>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/users/${car.owner_id}`}>
                                            View Profile
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing & Rental */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing & Rental
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hourly Rate</p>
                                        <p className="font-medium">{formatCurrency(car.hourly_rate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Daily Rate</p>
                                        <p className="font-medium">{formatCurrency(car.daily_rate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Daily Hour Threshold</p>
                                        <p className="font-medium">{car.daily_hour_threshold} hours</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Deposit Amount</p>
                                        <p className="font-medium">{formatCurrency(car.deposit_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Min. Rental Hours</p>
                                        <p className="font-medium">{car.min_rental_hours} hours</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Overtime Fee/Hour</p>
                                        <p className="font-medium">{formatCurrency(car.overtime_fee_per_hour)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Delivery Available</p>
                                        <p className="font-medium">
                                            {car.is_delivery_available ? (
                                                <Badge className="bg-green-100 text-green-800">Yes</Badge>
                                            ) : (
                                                <Badge className="bg-gray-100 text-gray-800">No</Badge>
                                            )}
                                        </p>
                                    </div>
                                    {car.is_delivery_available && (
                                        <>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Delivery Fee/km</p>
                                                <p className="font-medium">{formatCurrency(car.delivery_fee_per_km || '0')}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-sm text-muted-foreground">Max Delivery Distance</p>
                                                <p className="font-medium">{car.max_delivery_distance} km</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Maintenance & Documents */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Maintenance & Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Odometer</p>
                                        <p className="font-medium">{car.odometer_km.toLocaleString()} km</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Maintenance</p>
                                        <p className={`font-medium ${needsMaintenance ? 'text-red-600' : ''}`}>
                                            {car.next_maintenance_km ? `${car.next_maintenance_km.toLocaleString()} km` : 'N/A'}
                                            {needsMaintenance && ' (Due!)'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Maintenance</p>
                                        <p className="font-medium">{formatDate(car.last_maintenance_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Insurance Expiry</p>
                                        <p className={`font-medium ${
                                            isExpired(car.insurance_expiry) ? 'text-red-600' :
                                            isExpiringSoon(car.insurance_expiry) ? 'text-yellow-600' : ''
                                        }`}>
                                            {formatDate(car.insurance_expiry)}
                                            {isExpired(car.insurance_expiry) && ' (Expired!)'}
                                            {isExpiringSoon(car.insurance_expiry) && ' (Expiring Soon)'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Registration Expiry</p>
                                        <p className={`font-medium ${
                                            isExpired(car.registration_expiry) ? 'text-red-600' :
                                            isExpiringSoon(car.registration_expiry) ? 'text-yellow-600' : ''
                                        }`}>
                                            {formatDate(car.registration_expiry)}
                                            {isExpired(car.registration_expiry) && ' (Expired!)'}
                                            {isExpiringSoon(car.registration_expiry) && ' (Expiring Soon)'}
                                        </p>
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
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Rentals</p>
                                        <p className="text-2xl font-bold">{car.rental_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Average Rating</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-2xl font-bold">
                                                {car.average_rating ? parseFloat(car.average_rating).toFixed(1) : 'N/A'}
                                            </p>
                                            {car.average_rating && (
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        {car.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{car.description}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Features & Amenities */}
                        {features.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Features & Amenities</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {features.length} feature{features.length !== 1 ? 's' : ''} available
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        // Feature mapping with categories
                                        const FEATURE_MAP: Record<string, { label: string; category: string; icon?: string }> = {
                                            // Safety Features
                                            backup_camera: { label: 'Backup Camera', category: 'Safety' },
                                            dashcam: { label: 'Dash Cam', category: 'Safety' },
                                            airbags: { label: 'Airbags', category: 'Safety' },
                                            abs: { label: 'ABS Brakes', category: 'Safety' },
                                            parking_sensors: { label: 'Parking Sensors', category: 'Safety' },
                                            tire_pressure_monitor: { label: 'Tire Pressure Monitor', category: 'Safety' },
                                            collision_warning: { label: 'Collision Warning', category: 'Safety' },
                                            '360_camera': { label: '360° Camera', category: 'Safety' },
                                            
                                            // Technology
                                            gps: { label: 'GPS Navigation', category: 'Technology' },
                                            bluetooth: { label: 'Bluetooth', category: 'Technology' },
                                            usb_port: { label: 'USB Port', category: 'Technology' },
                                            etc: { label: 'ETC', category: 'Technology' },
                                            apple_carplay: { label: 'Apple CarPlay', category: 'Technology' },
                                            android_auto: { label: 'Android Auto', category: 'Technology' },
                                            
                                            // Comfort
                                            air_conditioning: { label: 'Air Conditioning', category: 'Comfort' },
                                            sunroof: { label: 'Sunroof', category: 'Comfort' },
                                            leather_seats: { label: 'Leather Seats', category: 'Comfort' },
                                            heated_seats: { label: 'Heated Seats', category: 'Comfort' },
                                            spare_tire: { label: 'Spare Tire', category: 'Comfort' },
                                            cruise_control: { label: 'Cruise Control', category: 'Comfort' },
                                            power_windows: { label: 'Power Windows', category: 'Comfort' },
                                            keyless_entry: { label: 'Keyless Entry', category: 'Comfort' },
                                            
                                            // Entertainment
                                            dvd_screen: { label: 'DVD Screen', category: 'Entertainment' },
                                            premium_sound: { label: 'Premium Sound System', category: 'Entertainment' },
                                            aux_port: { label: 'AUX Port', category: 'Entertainment' },
                                        };

                                        // Categorize features
                                        const categorized: Record<string, string[]> = {};
                                        
                                        features.forEach((featureId: string) => {
                                            const featureInfo = FEATURE_MAP[featureId];
                                            if (featureInfo) {
                                                const category = featureInfo.category;
                                                if (!categorized[category]) {
                                                    categorized[category] = [];
                                                }
                                                categorized[category].push(featureInfo.label);
                                            }
                                        });

                                        // Category order and colors
                                        const categoryStyles: Record<string, string> = {
                                            'Safety': 'bg-blue-50 text-blue-700 border-blue-200',
                                            'Technology': 'bg-purple-50 text-purple-700 border-purple-200',
                                            'Comfort': 'bg-green-50 text-green-700 border-green-200',
                                            'Entertainment': 'bg-orange-50 text-orange-700 border-orange-200',
                                        };

                                        return (
                                            <div className="space-y-4">
                                                {Object.entries(categorized).map(([category, featureLabels]) => (
                                                    <div key={category} className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-semibold text-foreground">{category}</h4>
                                                            <span className="text-xs text-muted-foreground">({featureLabels.length})</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {featureLabels.map((label: string) => (
                                                                <Badge 
                                                                    key={label} 
                                                                    variant="outline" 
                                                                    className={`text-xs font-medium ${categoryStyles[category]}`}
                                                                >
                                                                    <CheckCircle className="mr-1.5 h-3 w-3" />
                                                                    {label}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - 1/3 width */}
                    <div className="space-y-6">
                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Car ID</p>
                                    <p className="font-mono text-sm">{car.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <Link
                                        href={`/admin/locations/${car.location_id}`}
                                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        {car.location?.name}
                                    </Link>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="text-sm">{formatDate(car.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                    <p className="text-sm">{formatDate(car.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Warnings */}
                        {(isExpired(car.insurance_expiry) ||
                            isExpired(car.registration_expiry) ||
                            needsMaintenance) && (
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <AlertTriangle className="h-5 w-5" />
                                        Warnings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {isExpired(car.insurance_expiry) && (
                                        <div className="flex items-start gap-2 text-sm text-red-800">
                                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>Insurance has expired</span>
                                        </div>
                                    )}
                                    {isExpired(car.registration_expiry) && (
                                        <div className="flex items-start gap-2 text-sm text-red-800">
                                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>Registration has expired</span>
                                        </div>
                                    )}
                                    {needsMaintenance && (
                                        <div className="flex items-start gap-2 text-sm text-red-800">
                                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>Maintenance is due</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Upcoming Warnings */}
                        {(isExpiringSoon(car.insurance_expiry) || isExpiringSoon(car.registration_expiry)) && (
                            <Card className="border-yellow-200 bg-yellow-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-yellow-800">
                                        <AlertTriangle className="h-5 w-5" />
                                        Attention Required
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {isExpiringSoon(car.insurance_expiry) && (
                                        <div className="flex items-start gap-2 text-sm text-yellow-800">
                                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>Insurance expiring within 30 days</span>
                                        </div>
                                    )}
                                    {isExpiringSoon(car.registration_expiry) && (
                                        <div className="flex items-start gap-2 text-sm text-yellow-800">
                                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>Registration expiring within 30 days</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    {getStatusBadge(car.status)}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Verified</span>
                                    {car.is_verified ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Delivery</span>
                                    {car.is_delivery_available ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Images</span>
                                    <span className="font-medium">{images.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Features</span>
                                    <span className="font-medium">{features.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Car</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {car.brand?.name} {car.model} ({car.license_plate})?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Car'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
