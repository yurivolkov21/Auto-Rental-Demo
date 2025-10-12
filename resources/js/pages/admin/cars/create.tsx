import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Loader2, Save, Calculator } from 'lucide-react';
import { type User, type CarBrand, type CarCategory, type Location, type BreadcrumbItem } from '@/types';

interface CreateProps {
    owners: User[];
    brands: CarBrand[];
    categories: CarCategory[];
    locations: Location[];
}

const FEATURES = [
    // Safety Features
    { id: 'backup_camera', label: 'Backup Camera', category: 'Safety' },
    { id: 'dashcam', label: 'Dash Cam', category: 'Safety' },
    { id: 'airbags', label: 'Airbags', category: 'Safety' },
    { id: 'abs', label: 'ABS Brakes', category: 'Safety' },
    { id: 'parking_sensors', label: 'Parking Sensors', category: 'Safety' },
    { id: 'tire_pressure_monitor', label: 'Tire Pressure Monitor', category: 'Safety' },
    { id: 'collision_warning', label: 'Collision Warning', category: 'Safety' },
    { id: '360_camera', label: '360° Camera', category: 'Safety' },
    
    // Technology
    { id: 'gps', label: 'GPS Navigation', category: 'Technology' },
    { id: 'bluetooth', label: 'Bluetooth', category: 'Technology' },
    { id: 'usb_port', label: 'USB Port', category: 'Technology' },
    { id: 'etc', label: 'ETC (Electronic Toll Collection)', category: 'Technology' },
    { id: 'apple_carplay', label: 'Apple CarPlay', category: 'Technology' },
    { id: 'android_auto', label: 'Android Auto', category: 'Technology' },
    
    // Comfort
    { id: 'air_conditioning', label: 'Air Conditioning', category: 'Comfort' },
    { id: 'sunroof', label: 'Sunroof', category: 'Comfort' },
    { id: 'leather_seats', label: 'Leather Seats', category: 'Comfort' },
    { id: 'heated_seats', label: 'Heated Seats', category: 'Comfort' },
    { id: 'spare_tire', label: 'Spare Tire', category: 'Comfort' },
    { id: 'cruise_control', label: 'Cruise Control', category: 'Comfort' },
    { id: 'power_windows', label: 'Power Windows', category: 'Comfort' },
    { id: 'keyless_entry', label: 'Keyless Entry', category: 'Comfort' },
    
    // Entertainment
    { id: 'dvd_screen', label: 'DVD Screen', category: 'Entertainment' },
    { id: 'premium_sound', label: 'Premium Sound System', category: 'Entertainment' },
    { id: 'aux_port', label: 'AUX Port', category: 'Entertainment' },
];

export default function Create({ owners, brands, categories, locations }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        owner_id: '',
        brand_id: '',
        category_id: '',
        location_id: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        seats: '5',
        license_plate: '',
        vin: '',
        transmission: 'automatic',
        fuel_type: 'petrol' as 'petrol' | 'diesel' | 'electric' | 'hybrid',
        odometer_km: 0,
        insurance_expiry: '',
        registration_expiry: '',
        last_maintenance_date: '',
        next_maintenance_km: 0,
        hourly_rate: 0,
        daily_rate: 0,
        daily_hour_threshold: 10,
        deposit_amount: 0,
        min_rental_hours: 4,
        overtime_fee_per_hour: 0,
        is_delivery_available: false,
        delivery_fee_per_km: 0,
        max_delivery_distance: 0,
        description: '',
        features: [] as string[],
        status: 'available' as 'available' | 'rented' | 'maintenance' | 'inactive',
        is_verified: false,
    });

    const [previewHours, setPreviewHours] = useState(24);

    const calculatePreview = (hours: number) => {
        if (hours < (data.daily_hour_threshold || 10)) {
            return hours * (data.hourly_rate || 0);
        }
        const days = Math.ceil(hours / 24);
        return days * (data.daily_rate || 0);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/cars');
    };

    const handleFeatureToggle = (featureId: string) => {
        setData('features', 
            data.features.includes(featureId)
                ? data.features.filter(f => f !== featureId)
                : [...data.features, featureId]
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Cars', href: '/admin/cars' },
        { title: 'Create', href: '/admin/cars/create' },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Car" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/cars">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Car</h1>
                        <p className="text-sm text-muted-foreground">
                            Add a new vehicle to your rental fleet
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - 2/3 width */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Primary details about the vehicle
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="owner_id">Owner *</Label>
                                            <Select
                                                value={data.owner_id}
                                                onValueChange={(value) => setData('owner_id', value)}
                                            >
                                                <SelectTrigger id="owner_id">
                                                    <SelectValue placeholder="Select owner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {owners.map((owner) => (
                                                        <SelectItem key={owner.id} value={owner.id.toString()}>
                                                            {owner.name} ({owner.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.owner_id && (
                                                <p className="text-sm text-destructive">{errors.owner_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id">Brand *</Label>
                                            <Select
                                                value={data.brand_id}
                                                onValueChange={(value) => setData('brand_id', value)}
                                            >
                                                <SelectTrigger id="brand_id">
                                                    <SelectValue placeholder="Select brand" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brands.map((brand) => (
                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                            {brand.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.brand_id && (
                                                <p className="text-sm text-destructive">{errors.brand_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category_id">Category *</Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(value) => setData('category_id', value)}
                                            >
                                                <SelectTrigger id="category_id">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-destructive">{errors.category_id}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="location_id">Location *</Label>
                                            <Select
                                                value={data.location_id}
                                                onValueChange={(value) => setData('location_id', value)}
                                            >
                                                <SelectTrigger id="location_id">
                                                    <SelectValue placeholder="Select location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {locations.map((location) => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.location_id && (
                                                <p className="text-sm text-destructive">{errors.location_id}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="model">Model *</Label>
                                            <Input
                                                id="model"
                                                value={data.model}
                                                onChange={(e) => setData('model', e.target.value)}
                                                placeholder="e.g., Camry, Civic, Vios"
                                            />
                                            {errors.model && (
                                                <p className="text-sm text-destructive">{errors.model}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year">Year *</Label>
                                            <Input
                                                id="year"
                                                type="number"
                                                value={data.year}
                                                onChange={(e) => setData('year', parseInt(e.target.value))}
                                                min={2000}
                                                max={new Date().getFullYear() + 1}
                                            />
                                            {errors.year && (
                                                <p className="text-sm text-destructive">{errors.year}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="color">Color *</Label>
                                            <Input
                                                id="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                placeholder="e.g., White, Black, Silver"
                                            />
                                            {errors.color && (
                                                <p className="text-sm text-destructive">{errors.color}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="seats">Seats *</Label>
                                            <Select
                                                value={data.seats}
                                                onValueChange={(value) => setData('seats', value)}
                                            >
                                                <SelectTrigger id="seats">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[2, 4, 5, 7, 8, 9, 16].map((num) => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            {num} seats
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.seats && (
                                                <p className="text-sm text-destructive">{errors.seats}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Vehicle Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vehicle Details</CardTitle>
                                    <CardDescription>
                                        Technical specifications and identification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="license_plate">License Plate *</Label>
                                            <Input
                                                id="license_plate"
                                                value={data.license_plate}
                                                onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                                placeholder="e.g., 51F-12345"
                                            />
                                            {errors.license_plate && (
                                                <p className="text-sm text-destructive">{errors.license_plate}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="vin">VIN Number</Label>
                                            <Input
                                                id="vin"
                                                value={data.vin}
                                                onChange={(e) => setData('vin', e.target.value.toUpperCase())}
                                                placeholder="17-character VIN"
                                                maxLength={17}
                                            />
                                            {errors.vin && (
                                                <p className="text-sm text-destructive">{errors.vin}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="transmission">Transmission *</Label>
                                            <Select
                                                value={data.transmission}
                                                onValueChange={(value) => setData('transmission', value as 'manual' | 'automatic')}
                                            >
                                                <SelectTrigger id="transmission">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="automatic">Automatic</SelectItem>
                                                    <SelectItem value="manual">Manual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.transmission && (
                                                <p className="text-sm text-destructive">{errors.transmission}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fuel_type">Fuel Type *</Label>
                                            <Select
                                                value={data.fuel_type}
                                                onValueChange={(value) => setData('fuel_type', value as 'petrol' | 'diesel' | 'electric' | 'hybrid')}
                                            >
                                                <SelectTrigger id="fuel_type">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="petrol">Petrol</SelectItem>
                                                    <SelectItem value="diesel">Diesel</SelectItem>
                                                    <SelectItem value="electric">Electric</SelectItem>
                                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.fuel_type && (
                                                <p className="text-sm text-destructive">{errors.fuel_type}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="odometer_km">Current Odometer (km) *</Label>
                                        <Input
                                            id="odometer_km"
                                            type="number"
                                            value={data.odometer_km}
                                            onChange={(e) => setData('odometer_km', parseInt(e.target.value))}
                                            min={0}
                                        />
                                        {errors.odometer_km && (
                                            <p className="text-sm text-destructive">{errors.odometer_km}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents & Maintenance */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Documents & Maintenance</CardTitle>
                                    <CardDescription>
                                        Insurance, registration, and maintenance schedules
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="insurance_expiry">Insurance Expiry *</Label>
                                            <Input
                                                id="insurance_expiry"
                                                type="date"
                                                value={data.insurance_expiry}
                                                onChange={(e) => setData('insurance_expiry', e.target.value)}
                                            />
                                            {errors.insurance_expiry && (
                                                <p className="text-sm text-destructive">{errors.insurance_expiry}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="registration_expiry">Registration Expiry *</Label>
                                            <Input
                                                id="registration_expiry"
                                                type="date"
                                                value={data.registration_expiry}
                                                onChange={(e) => setData('registration_expiry', e.target.value)}
                                            />
                                            {errors.registration_expiry && (
                                                <p className="text-sm text-destructive">{errors.registration_expiry}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="last_maintenance_date">Last Maintenance Date</Label>
                                            <Input
                                                id="last_maintenance_date"
                                                type="date"
                                                value={data.last_maintenance_date}
                                                onChange={(e) => setData('last_maintenance_date', e.target.value)}
                                            />
                                            {errors.last_maintenance_date && (
                                                <p className="text-sm text-destructive">{errors.last_maintenance_date}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="next_maintenance_km">Next Maintenance (km)</Label>
                                            <Input
                                                id="next_maintenance_km"
                                                type="number"
                                                value={data.next_maintenance_km}
                                                onChange={(e) => setData('next_maintenance_km', parseInt(e.target.value))}
                                                min={0}
                                            />
                                            {errors.next_maintenance_km && (
                                                <p className="text-sm text-destructive">{errors.next_maintenance_km}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing Configuration */}
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle>Pricing Configuration</CardTitle>
                                    <CardDescription>
                                        Set rental rates and deposit requirements
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hourly_rate">Hourly Rate (₫) *</Label>
                                            <Input
                                                id="hourly_rate"
                                                type="number"
                                                value={data.hourly_rate}
                                                onChange={(e) => setData('hourly_rate', parseFloat(e.target.value))}
                                                min={0}
                                                step={10000}
                                            />
                                            {errors.hourly_rate && (
                                                <p className="text-sm text-destructive">{errors.hourly_rate}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="daily_rate">Daily Rate (₫) *</Label>
                                            <Input
                                                id="daily_rate"
                                                type="number"
                                                value={data.daily_rate}
                                                onChange={(e) => setData('daily_rate', parseFloat(e.target.value))}
                                                min={0}
                                                step={10000}
                                            />
                                            {errors.daily_rate && (
                                                <p className="text-sm text-destructive">{errors.daily_rate}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="daily_hour_threshold">Daily Hour Threshold</Label>
                                            <Input
                                                id="daily_hour_threshold"
                                                type="number"
                                                value={data.daily_hour_threshold}
                                                onChange={(e) => setData('daily_hour_threshold', parseInt(e.target.value))}
                                                min={1}
                                                max={24}
                                            />
                                            {errors.daily_hour_threshold && (
                                                <p className="text-sm text-destructive">{errors.daily_hour_threshold}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="deposit_amount">Deposit Amount (₫) *</Label>
                                            <Input
                                                id="deposit_amount"
                                                type="number"
                                                value={data.deposit_amount}
                                                onChange={(e) => setData('deposit_amount', parseFloat(e.target.value))}
                                                min={0}
                                                step={100000}
                                            />
                                            {errors.deposit_amount && (
                                                <p className="text-sm text-destructive">{errors.deposit_amount}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="min_rental_hours">Min. Rental Hours</Label>
                                            <Input
                                                id="min_rental_hours"
                                                type="number"
                                                value={data.min_rental_hours}
                                                onChange={(e) => setData('min_rental_hours', parseInt(e.target.value))}
                                                min={1}
                                            />
                                            {errors.min_rental_hours && (
                                                <p className="text-sm text-destructive">{errors.min_rental_hours}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="overtime_fee_per_hour">Overtime Fee/Hour (₫)</Label>
                                            <Input
                                                id="overtime_fee_per_hour"
                                                type="number"
                                                value={data.overtime_fee_per_hour}
                                                onChange={(e) => setData('overtime_fee_per_hour', parseFloat(e.target.value))}
                                                min={0}
                                                step={10000}
                                            />
                                            {errors.overtime_fee_per_hour && (
                                                <p className="text-sm text-destructive">{errors.overtime_fee_per_hour}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Delivery Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Delivery Settings</CardTitle>
                                    <CardDescription>
                                        Configure delivery options and fees
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_delivery_available"
                                            checked={data.is_delivery_available}
                                            onCheckedChange={(checked) => setData('is_delivery_available', checked as boolean)}
                                        />
                                        <Label htmlFor="is_delivery_available" className="cursor-pointer">
                                            Enable delivery service for this vehicle
                                        </Label>
                                    </div>

                                    {data.is_delivery_available && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="delivery_fee_per_km">Delivery Fee per km (₫) *</Label>
                                                <Input
                                                    id="delivery_fee_per_km"
                                                    type="number"
                                                    value={data.delivery_fee_per_km}
                                                    onChange={(e) => setData('delivery_fee_per_km', parseFloat(e.target.value))}
                                                    min={0}
                                                    step={1000}
                                                />
                                                {errors.delivery_fee_per_km && (
                                                    <p className="text-sm text-destructive">{errors.delivery_fee_per_km}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="max_delivery_distance">Max Delivery Distance (km) *</Label>
                                                <Input
                                                    id="max_delivery_distance"
                                                    type="number"
                                                    value={data.max_delivery_distance}
                                                    onChange={(e) => setData('max_delivery_distance', parseFloat(e.target.value))}
                                                    min={0}
                                                />
                                                {errors.max_delivery_distance && (
                                                    <p className="text-sm text-destructive">{errors.max_delivery_distance}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Description & Features */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description & Features</CardTitle>
                                    <CardDescription>
                                        Detailed description and available features
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Describe the vehicle condition, special features, or any important notes..."
                                            rows={4}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Features</Label>
                                        
                                        {/* Group features by category */}
                                        {['Safety', 'Technology', 'Comfort', 'Entertainment'].map((category) => {
                                            const categoryFeatures = FEATURES.filter(f => f.category === category);
                                            if (categoryFeatures.length === 0) return null;
                                            
                                            return (
                                                <div key={category} className="space-y-2">
                                                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {categoryFeatures.map((feature) => (
                                                            <div key={feature.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={feature.id}
                                                                    checked={data.features.includes(feature.id)}
                                                                    onCheckedChange={() => handleFeatureToggle(feature.id)}
                                                                />
                                                                <Label htmlFor={feature.id} className="cursor-pointer font-normal text-sm">
                                                                    {feature.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar - 1/3 width */}
                        <div className="space-y-6">
                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as 'available' | 'rented' | 'maintenance' | 'inactive')}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="rented">Rented</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_verified"
                                            checked={data.is_verified}
                                            onCheckedChange={(checked) => setData('is_verified', checked as boolean)}
                                        />
                                        <Label htmlFor="is_verified" className="cursor-pointer">
                                            Verified Vehicle
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing Preview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-4 w-4" />
                                        Pricing Preview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="preview_hours">Hours</Label>
                                        <Input
                                            id="preview_hours"
                                            type="number"
                                            value={previewHours}
                                            onChange={(e) => setPreviewHours(parseInt(e.target.value))}
                                            min={1}
                                        />
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Duration:</span>
                                            <span className="font-medium">{previewHours} hours</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Rate Type:</span>
                                            <span className="font-medium">
                                                {previewHours < (data.daily_hour_threshold || 10) ? 'Hourly' : 'Daily'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                            <span>Total:</span>
                                            <span className="text-primary">{formatCurrency(calculatePreview(previewHours))}</span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-muted-foreground space-y-1">
                                        <p>• Hourly: {formatCurrency(data.hourly_rate)}/hour</p>
                                        <p>• Daily: {formatCurrency(data.daily_rate)}/day</p>
                                        <p>• Switches to daily rate after {data.daily_hour_threshold} hours</p>
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
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Car
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.history.back()}
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
