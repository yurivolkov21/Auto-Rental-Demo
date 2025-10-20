import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    Mail,
    MapPin,
    Phone,
    Plane,
    Star,
} from 'lucide-react';
import { FormEventHandler } from 'react';

interface ContactProps {
    locations: Array<{
        id: number;
        name: string;
        address: string | null;
        phone: string | null;
        email: string | null;
        is_airport: boolean;
        is_popular: boolean;
    }>;
}

export default function Contact({ locations }: ContactProps) {
    const { props } = usePage();
    const auth = props.auth as { user: { name: string; email: string } | null };
    const flash = props.flash as
        | { success?: string; error?: string }
        | undefined;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        phone: '',
        subject: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset('phone', 'subject', 'message');
            },
        });
    };

    return (
        <CustomerLayout
            title="Contact Us"
            description="Get in touch with AutoRental. We're here to help with your car rental needs."
        >
            {/* Hero Section */}
            <section className="relative flex min-h-[300px] items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                            Contact Us
                        </h1>
                        <p className="text-xl leading-relaxed text-blue-100">
                            Have questions? We're here to help! Reach out to us
                            and we'll respond as soon as possible.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-8 lg:grid-cols-3">
                            {/* Contact Form - 2 columns */}
                            <div className="lg:col-span-2">
                                <Card className="border-0 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">
                                            Send us a message
                                        </CardTitle>
                                        <CardDescription>
                                            Fill out the form below and we'll
                                            get back to you within 24 hours
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Success Message */}
                                        {flash?.success && (
                                            <Alert className="mb-6 border-green-200 bg-green-50">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                <AlertDescription className="text-green-800">
                                                    {flash.success}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {/* Error Message */}
                                        {flash?.error && (
                                            <Alert className="mb-6 border-red-200 bg-red-50">
                                                <AlertDescription className="text-red-800">
                                                    {flash.error}
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        <form
                                            onSubmit={submit}
                                            className="space-y-6"
                                        >
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">
                                                        Name{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.name
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                        required
                                                    />
                                                    {errors.name && (
                                                        <p className="text-sm text-red-500">
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">
                                                        Email{' '}
                                                        <span className="text-red-500">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) =>
                                                            setData(
                                                                'email',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.email
                                                                ? 'border-red-500'
                                                                : ''
                                                        }
                                                        required
                                                    />
                                                    {errors.email && (
                                                        <p className="text-sm text-red-500">
                                                            {errors.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone (Optional)
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.phone
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subject">
                                                    Subject{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="subject"
                                                    type="text"
                                                    value={data.subject}
                                                    onChange={(e) =>
                                                        setData(
                                                            'subject',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.subject
                                                            ? 'border-red-500'
                                                            : ''
                                                    }
                                                    placeholder="How can we help you?"
                                                    required
                                                />
                                                {errors.subject && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.subject}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">
                                                    Message{' '}
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                </Label>
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={(e) =>
                                                        setData(
                                                            'message',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={
                                                        errors.message
                                                            ? 'border-red-500'
                                                            : '' +
                                                              ' min-h-[150px]'
                                                    }
                                                    placeholder="Tell us more about your inquiry..."
                                                    required
                                                />
                                                {errors.message && (
                                                    <p className="text-sm text-red-500">
                                                        {errors.message}
                                                    </p>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Sending...'
                                                    : 'Send Message'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Contact Info Sidebar - 1 column */}
                            <div className="space-y-6">
                                {/* Quick Contact Info */}
                                <Card className="border-0 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Get in Touch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                <Mail className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Email
                                                </div>
                                                <a
                                                    href="mailto:support@autorental.com"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    support@autorental.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                                <Phone className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Phone
                                                </div>
                                                <a
                                                    href="tel:+84123456789"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    +84 123 456 789
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                                                <Clock className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    Business Hours
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Mon - Sun: 8:00 AM - 10:00
                                                    PM
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* FAQ Link */}
                                <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md">
                                    <CardContent className="p-6">
                                        <h3 className="mb-2 font-bold text-gray-900">
                                            Looking for quick answers?
                                        </h3>
                                        <p className="mb-4 text-sm text-gray-600">
                                            Check out our FAQ page for instant
                                            answers to common questions.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <a href="/faq">View FAQ</a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </CustomerLayout>
    );
}
