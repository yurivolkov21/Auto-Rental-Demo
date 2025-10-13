import VerificationController from '@/actions/App/Http/Controllers/Settings/VerificationController';
import { type BreadcrumbItem, type UserVerification } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/verification';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Identity Verification',
        href: edit().url,
    },
];

const LICENSE_TYPES = [
    { value: 'B1', label: 'B1 - Motorcycles & small vehicles' },
    { value: 'B2', label: 'B2 - Cars (4-9 seats)' },
    { value: 'C', label: 'C - Trucks' },
    { value: 'D', label: 'D - Passenger vehicles (10-16 seats)' },
    { value: 'E', label: 'E - Large passenger vehicles' },
];

const STATUS_CONFIG = {
    pending: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Pending Review',
    },
    verified: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Verified',
    },
    rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        label: 'Rejected',
    },
    expired: {
        icon: AlertCircle,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        label: 'Expired',
    },
};

export default function Verification({
    verification,
}: {
    verification: UserVerification;
}) {
    // License images (front & back)
    const [licenseFrontPreview, setLicenseFrontPreview] = useState<string | null>(
        verification.license_front_image ? `/storage/${verification.license_front_image}` : null
    );
    const [licenseBackPreview, setLicenseBackPreview] = useState<string | null>(
        verification.license_back_image ? `/storage/${verification.license_back_image}` : null
    );

    // ID card images (front & back)
    const [idCardFrontPreview, setIdCardFrontPreview] = useState<string | null>(
        verification.id_card_front_image ? `/storage/${verification.id_card_front_image}` : null
    );
    const [idCardBackPreview, setIdCardBackPreview] = useState<string | null>(
        verification.id_card_back_image ? `/storage/${verification.id_card_back_image}` : null
    );

    // Selfie
    const [selfiePreview, setSelfiePreview] = useState<string | null>(
        verification.selfie_image ? `/storage/${verification.selfie_image}` : null
    );

    const handleFilePreview = (
        event: React.ChangeEvent<HTMLInputElement>,
        setPreview: (preview: string | null) => void
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Default to 'pending' if status is undefined
    const currentStatus = verification.status || 'pending';
    const StatusIcon = STATUS_CONFIG[currentStatus]?.icon || Clock;
    const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Identity Verification" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <HeadingSmall
                            title="Identity Verification"
                            description="Complete your identity verification to access all platform features"
                        />

                        {/* Status Badge */}
                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {statusConfig.label}
                            </Badge>
                        </div>

                        {/* Rejection Reason */}
                        {verification.status === 'rejected' && verification.rejected_reason && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Verification Rejected</AlertTitle>
                                <AlertDescription>
                                    {verification.rejected_reason}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Info Alert */}
                        {verification.status !== 'verified' && (
                            <Alert className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Why verify your identity?</AlertTitle>
                                <AlertDescription>
                                    Identity verification helps us ensure a safe and trustworthy community.
                                    Verified users have access to premium features and can book vehicles instantly.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Form
                        {...VerificationController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-8"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Driving License Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Driving License Information</CardTitle>
                                        <CardDescription>
                                            Upload clear photos of both sides of your valid driving license
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* License Front Image Upload */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="license_front_image">
                                                License Front Side *
                                            </Label>
                                            <div className="mb-2">
                                                {licenseFrontPreview ? (
                                                    <img
                                                        src={licenseFrontPreview}
                                                        alt="License front preview"
                                                        className="h-48 w-auto rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                                                        <p className="text-sm text-muted-foreground">
                                                            No image selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="license_front_image"
                                                name="license_front_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleFilePreview(e, setLicenseFrontPreview)}
                                                disabled={verification.status === 'verified'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Max file size: 5MB. Formats: JPEG, PNG, WebP
                                            </p>
                                            <InputError message={errors.license_front_image} />
                                        </div>

                                        {/* License Back Image Upload */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="license_back_image">
                                                License Back Side *
                                            </Label>
                                            <div className="mb-2">
                                                {licenseBackPreview ? (
                                                    <img
                                                        src={licenseBackPreview}
                                                        alt="License back preview"
                                                        className="h-48 w-auto rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                                                        <p className="text-sm text-muted-foreground">
                                                            No image selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="license_back_image"
                                                name="license_back_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleFilePreview(e, setLicenseBackPreview)}
                                                disabled={verification.status === 'verified'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Max file size: 5MB. Formats: JPEG, PNG, WebP
                                            </p>
                                            <InputError message={errors.license_back_image} />
                                        </div>

                                        {/* License Number */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="driving_license_number">
                                                License Number
                                            </Label>
                                            <Input
                                                id="driving_license_number"
                                                name="driving_license_number"
                                                defaultValue={verification.driving_license_number || ''}
                                                placeholder="e.g., 012345678"
                                                disabled={verification.status === 'verified'}
                                            />
                                            <InputError message={errors.driving_license_number} />
                                        </div>

                                        {/* License Type */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="license_type">License Type</Label>
                                            <Select
                                                name="license_type"
                                                defaultValue={verification.license_type || ''}
                                                disabled={verification.status === 'verified'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select license type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LICENSE_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.license_type} />
                                        </div>

                                        {/* Issue and Expiry Dates */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="license_issue_date">Issue Date</Label>
                                                <Input
                                                    id="license_issue_date"
                                                    name="license_issue_date"
                                                    type="date"
                                                    defaultValue={verification.license_issue_date || ''}
                                                    disabled={verification.status === 'verified'}
                                                />
                                                <InputError message={errors.license_issue_date} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="license_expiry_date">Expiry Date</Label>
                                                <Input
                                                    id="license_expiry_date"
                                                    name="license_expiry_date"
                                                    type="date"
                                                    defaultValue={verification.license_expiry_date || ''}
                                                    disabled={verification.status === 'verified'}
                                                />
                                                <InputError message={errors.license_expiry_date} />
                                            </div>
                                        </div>

                                        {/* Issued Country */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="license_issued_country">
                                                Issued Country
                                            </Label>
                                            <Input
                                                id="license_issued_country"
                                                name="license_issued_country"
                                                defaultValue={verification.license_issued_country || 'Vietnam'}
                                                placeholder="e.g., Vietnam"
                                                disabled={verification.status === 'verified'}
                                            />
                                            <InputError message={errors.license_issued_country} />
                                        </div>

                                        {/* Driving Experience (for drivers) */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="driving_experience_years">
                                                Driving Experience (Years)
                                            </Label>
                                            <Input
                                                id="driving_experience_years"
                                                name="driving_experience_years"
                                                type="number"
                                                min="0"
                                                max="50"
                                                defaultValue={verification.driving_experience_years || ''}
                                                placeholder="e.g., 5"
                                                disabled={verification.status === 'verified'}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Optional: Specify how many years you've been driving
                                            </p>
                                            <InputError message={errors.driving_experience_years} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Identity Documents Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Identity Documents</CardTitle>
                                        <CardDescription>
                                            Upload both sides of your government-issued ID card (CCCD/CMND) and a selfie
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* ID Card Front Image Upload */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="id_card_front_image">
                                                ID Card Front Side *
                                            </Label>
                                            <div className="mb-2">
                                                {idCardFrontPreview ? (
                                                    <img
                                                        src={idCardFrontPreview}
                                                        alt="ID card front preview"
                                                        className="h-48 w-auto rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                                                        <p className="text-sm text-muted-foreground">
                                                            No image selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="id_card_front_image"
                                                name="id_card_front_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleFilePreview(e, setIdCardFrontPreview)}
                                                disabled={verification.status === 'verified'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Upload the front side of your CCCD, CMND, or passport (max 5MB)
                                            </p>
                                            <InputError message={errors.id_card_front_image} />
                                        </div>

                                        {/* ID Card Back Image Upload */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="id_card_back_image">
                                                ID Card Back Side *
                                            </Label>
                                            <div className="mb-2">
                                                {idCardBackPreview ? (
                                                    <img
                                                        src={idCardBackPreview}
                                                        alt="ID card back preview"
                                                        className="h-48 w-auto rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                                                        <p className="text-sm text-muted-foreground">
                                                            No image selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="id_card_back_image"
                                                name="id_card_back_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleFilePreview(e, setIdCardBackPreview)}
                                                disabled={verification.status === 'verified'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Upload the back side of your CCCD or CMND (max 5MB)
                                            </p>
                                            <InputError message={errors.id_card_back_image} />
                                        </div>

                                        {/* Selfie Image Upload */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="selfie_image">
                                                Selfie Photo *
                                            </Label>
                                            <div className="mb-2">
                                                {selfiePreview ? (
                                                    <img
                                                        src={selfiePreview}
                                                        alt="Selfie preview"
                                                        className="h-48 w-auto rounded-md border object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-48 w-full items-center justify-center rounded-md border border-dashed bg-muted">
                                                        <p className="text-sm text-muted-foreground">
                                                            No image selected
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id="selfie_image"
                                                name="selfie_image"
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => handleFilePreview(e, setSelfiePreview)}
                                                disabled={verification.status === 'verified'}
                                                className="cursor-pointer"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Take a clear selfie holding your ID next to your face (max 5MB)
                                            </p>
                                            <InputError message={errors.selfie_image} />
                                        </div>

                                        {/* Nationality */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="nationality">Nationality</Label>
                                            <Input
                                                id="nationality"
                                                name="nationality"
                                                defaultValue={verification.nationality || ''}
                                                placeholder="e.g., Vietnamese"
                                                disabled={verification.status === 'verified'}
                                            />
                                            <InputError message={errors.nationality} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Separator />

                                {/* Submit Button */}
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing || verification.status === 'verified'}
                                    >
                                        {verification.status === 'verified'
                                            ? 'Verified'
                                            : verification.id
                                            ? 'Update Verification'
                                            : 'Submit for Verification'}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 dark:text-green-400">
                                            Verification information saved successfully
                                        </p>
                                    </Transition>
                                </div>

                                {verification.status === 'verified' && (
                                    <Alert>
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertTitle>Identity Verified</AlertTitle>
                                        <AlertDescription>
                                            Your identity has been verified. You now have access to all platform features.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
