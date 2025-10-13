import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { DriverProfileWithRelations } from '@/types/models/driver-profile';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    driver: DriverProfileWithRelations;
    owners: User[];
}

interface FormData {
    hourly_fee: string;
    daily_fee: string;
    overtime_fee_per_hour: string;
    daily_hour_threshold: number;
    status: 'available' | 'on_duty' | 'off_duty' | 'suspended';
    is_available_for_booking: boolean;
    working_hours: {
        monday?: string;
        tuesday?: string;
        wednesday?: string;
        thursday?: string;
        friday?: string;
        saturday?: string;
        sunday?: string;
    };
    owner_id: number | null;
}

export default function Edit({ driver, owners }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        hourly_fee: driver.hourly_fee,
        daily_fee: driver.daily_fee,
        overtime_fee_per_hour: driver.overtime_fee_per_hour,
        daily_hour_threshold: driver.daily_hour_threshold,
        status: driver.status,
        is_available_for_booking: driver.is_available_for_booking,
        working_hours: (driver.working_hours as Record<string, string>) || {},
        owner_id: driver.owner_id,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/admin/driver-profiles/${driver.id}`);
    };

    const handleWorkingHoursChange = (day: string, value: string) => {
        setData('working_hours', {
            ...data.working_hours,
            [day]: value,
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit Driver: ${driver.user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/driver-profiles/${driver.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Driver Profile</h1>
                            <p className="mt-1 text-muted-foreground">
                                Update {driver.user.name}'s profile settings
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 md:col-span-2">
                            {/* Pricing Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing Configuration</CardTitle>
                                    <CardDescription>Set driver service fees and rates</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="hourly_fee">
                                                Hourly Fee <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="hourly_fee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hourly_fee}
                                                onChange={(e) => setData('hourly_fee', e.target.value)}
                                                className={errors.hourly_fee ? 'border-destructive' : ''}
                                            />
                                            {errors.hourly_fee && (
                                                <p className="text-sm text-destructive">{errors.hourly_fee}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="daily_fee">
                                                Daily Fee <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="daily_fee"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.daily_fee}
                                                onChange={(e) => setData('daily_fee', e.target.value)}
                                                className={errors.daily_fee ? 'border-destructive' : ''}
                                            />
                                            {errors.daily_fee && (
                                                <p className="text-sm text-destructive">{errors.daily_fee}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="overtime_fee_per_hour">
                                                Overtime Fee/Hour <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="overtime_fee_per_hour"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.overtime_fee_per_hour}
                                                onChange={(e) => setData('overtime_fee_per_hour', e.target.value)}
                                                className={errors.overtime_fee_per_hour ? 'border-destructive' : ''}
                                            />
                                            {errors.overtime_fee_per_hour && (
                                                <p className="text-sm text-destructive">{errors.overtime_fee_per_hour}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="daily_hour_threshold">
                                                Daily Hour Threshold <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="daily_hour_threshold"
                                                type="number"
                                                min="1"
                                                max="24"
                                                value={data.daily_hour_threshold}
                                                onChange={(e) => setData('daily_hour_threshold', parseInt(e.target.value))}
                                                className={errors.daily_hour_threshold ? 'border-destructive' : ''}
                                            />
                                            {errors.daily_hour_threshold && (
                                                <p className="text-sm text-destructive">{errors.daily_hour_threshold}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Hours before switching to daily rate
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Working Hours */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Working Hours</CardTitle>
                                    <CardDescription>Set weekly schedule (e.g., "8-18" or "off")</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                        <div key={day} className="flex items-center gap-4">
                                            <Label htmlFor={day} className="w-28 capitalize">
                                                {day}
                                            </Label>
                                            <Input
                                                id={day}
                                                type="text"
                                                placeholder="8-18 or off"
                                                value={data.working_hours[day as keyof typeof data.working_hours] || ''}
                                                onChange={(e) => handleWorkingHoursChange(day, e.target.value)}
                                                className={errors[`working_hours.${day}` as keyof typeof errors] ? 'border-destructive' : ''}
                                            />
                                            {errors[`working_hours.${day}` as keyof typeof errors] && (
                                                <p className="text-sm text-destructive">
                                                    {errors[`working_hours.${day}` as keyof typeof errors]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status & Availability */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Availability</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status">
                                            Status <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value as typeof data.status)}
                                        >
                                            <SelectTrigger id="status" className={errors.status ? 'border-destructive' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="available">Available</SelectItem>
                                                <SelectItem value="on_duty">On Duty</SelectItem>
                                                <SelectItem value="off_duty">Off Duty</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-destructive">{errors.status}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                                        <Checkbox
                                            id="is_available_for_booking"
                                            checked={data.is_available_for_booking}
                                            onCheckedChange={(checked: boolean) => setData('is_available_for_booking', checked)}
                                        />
                                        <Label htmlFor="is_available_for_booking" className="flex-1 cursor-pointer">
                                            <div className="font-medium">Booking Availability</div>
                                            <div className="text-sm text-muted-foreground">
                                                Allow customers to book this driver
                                            </div>
                                        </Label>
                                    </div>
                                    {errors.is_available_for_booking && (
                                        <p className="text-sm text-destructive">{errors.is_available_for_booking}</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Employment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Employment</CardTitle>
                                    <CardDescription>Assign driver to a car owner</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Label htmlFor="owner_id">Car Owner (Optional)</Label>
                                    <Select
                                        value={data.owner_id?.toString() || 'none'}
                                        onValueChange={(value) => setData('owner_id', value === 'none' ? null : parseInt(value))}
                                    >
                                        <SelectTrigger id="owner_id">
                                            <SelectValue placeholder="Select owner..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Independent Driver</SelectItem>
                                            {owners.map((owner) => (
                                                <SelectItem key={owner.id} value={owner.id.toString()}>
                                                    {owner.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.owner_id && (
                                        <p className="text-sm text-destructive">{errors.owner_id}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Leave as "Independent Driver" if not employed
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Driver Info (Read-only) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Driver Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Name</p>
                                        <p className="font-medium">{driver.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{driver.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Completed Trips</p>
                                        <p className="font-medium">{driver.completed_trips}</p>
                                    </div>
                                    {driver.average_rating && (
                                        <div>
                                            <p className="text-muted-foreground">Average Rating</p>
                                            <p className="font-medium">{parseFloat(driver.average_rating).toFixed(1)} ⭐</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
