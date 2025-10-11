import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    user,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    user?: {
        date_of_birth?: string | null;
    };
}) {
    const { auth } = usePage<SharedData>().props;

    // Helper function to get avatar URL
    const getAvatarUrl = (avatar: string | null | undefined): string | null => {
        if (!avatar) return null;
        // If it's a full URL (http/https), return as is
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
            return avatar;
        }
        // Otherwise, it's a storage path - add cache buster
        return `/storage/${avatar}?t=${Date.now()}`;
    };

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        getAvatarUrl(auth.user.avatar)
    );

    // Sync avatar preview when auth.user.avatar changes (after save)
    useEffect(() => {
        console.log('Avatar changed:', auth.user.avatar);
        const newUrl = getAvatarUrl(auth.user.avatar);
        console.log('New avatar URL:', newUrl);
        setAvatarPreview(newUrl);
    }, [auth.user.avatar]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your personal information and profile details"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                {/* Avatar Section */}
                                <Card className="p-6">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage
                                                src={avatarPreview || undefined}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="text-2xl">
                                                {auth.user.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 space-y-2">
                                            <Label
                                                htmlFor="avatar"
                                                className="text-base"
                                            >
                                                Profile Picture
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Upload a profile picture (JPG,
                                                PNG, WebP. Max 2MB)
                                            </p>
                                            <Input
                                                id="avatar"
                                                type="file"
                                                name="avatar"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handleAvatarChange}
                                                className="cursor-pointer"
                                            />
                                            <InputError message={errors.avatar} />
                                        </div>
                                    </div>
                                </Card>

                                {/* Basic Information */}
                                <Card className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Basic Information
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Full Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="John Doe"
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                Email Address *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="john@example.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-medium underline underline-offset-4 hover:text-yellow-900 dark:hover:text-yellow-100"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </Card>

                                {/* Contact & Personal Details */}
                                <Card className="p-6 space-y-4">
                                    <h3 className="font-semibold text-lg">
                                        Contact & Personal Details
                                    </h3>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Phone Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                defaultValue={
                                                    auth.user.phone || ''
                                                }
                                                name="phone"
                                                autoComplete="tel"
                                                placeholder="+84 123 456 789"
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="date_of_birth">
                                                Date of Birth
                                            </Label>
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                defaultValue={
                                                    user?.date_of_birth || ''
                                                }
                                                name="date_of_birth"
                                            />
                                            <InputError
                                                message={errors.date_of_birth}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            defaultValue={
                                                auth.user.address || ''
                                            }
                                            name="address"
                                            placeholder="123 Main Street, District 1, Ho Chi Minh City"
                                            rows={3}
                                        />
                                        <InputError message={errors.address} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            defaultValue={auth.user.bio || ''}
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            rows={4}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Max 1000 characters
                                        </p>
                                        <InputError message={errors.bio} />
                                    </div>
                                </Card>

                                <Separator />

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save Changes
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                            ✓ Saved successfully
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
