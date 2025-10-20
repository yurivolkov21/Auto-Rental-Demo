import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import {
    Award,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    CreditCard,
    Headphones,
    MapPin,
    Plane,
    Settings,
    Shield,
    Users,
} from 'lucide-react';

interface ServicesProps {
    stats: {
        total_cars: number;
        total_drivers: number;
        total_locations: number;
        years_in_business: number;
    };
}

export default function Services({ stats }: ServicesProps) {
    const mainServices = [
        {
            icon: Car,
            title: 'Car Rental',
            description:
                'Choose from our extensive fleet of premium vehicles. From economy cars to luxury SUVs, we have the perfect car for every need and budget.',
            features: [
                'Wide selection of vehicles',
                'All cars regularly maintained',
                'Flexible rental periods',
                'Competitive pricing',
            ],
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
        },
        {
            icon: Users,
            title: 'Professional Driver Service',
            description:
                'Need a professional driver? Our experienced, licensed drivers are available to ensure a safe and comfortable journey for you and your family.',
            features: [
                'Licensed and experienced drivers',
                'Local area knowledge',
                'Hourly or daily rates',
                'Available 24/7',
            ],
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
        },
        {
            icon: Plane,
            title: 'Airport Transfer',
            description:
                'Convenient pickup and drop-off service at major airports. Start or end your trip hassle-free with our reliable airport transfer service.',
            features: [
                'Meet and greet service',
                'Flight tracking',
                'Fixed pricing',
                'Available at all major airports',
            ],
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
        },
        {
            icon: Calendar,
            title: 'Long-term Rental',
            description:
                'Need a car for weeks or months? Enjoy special rates on long-term rentals with flexible payment options and dedicated support.',
            features: [
                'Discounted rates for long-term',
                'Free vehicle maintenance',
                'Flexible contracts',
                'Vehicle replacement available',
            ],
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
        },
    ];

    const additionalServices = [
        {
            icon: Shield,
            title: 'Comprehensive Insurance',
            description:
                'All rentals include full insurance coverage for your peace of mind.',
        },
        {
            icon: Clock,
            title: '24/7 Support',
            description:
                'Round-the-clock customer support and roadside assistance.',
        },
        {
            icon: MapPin,
            title: 'Multiple Locations',
            description: `Pick up and drop off at ${stats.total_locations}+ convenient locations.`,
        },
        {
            icon: Headphones,
            title: 'Customer Care',
            description: 'Dedicated team to help with bookings and inquiries.',
        },
        {
            icon: CreditCard,
            title: 'Flexible Payment',
            description:
                'Multiple payment options including credit cards and bank transfer.',
        },
        {
            icon: Settings,
            title: 'GPS & Extras',
            description:
                'Additional equipment available including GPS, child seats, and more.',
        },
    ];

    const benefits = [
        'No hidden fees - transparent pricing',
        'Easy online booking with instant confirmation',
        'Well-maintained, clean vehicles',
        'Flexible cancellation policy',
        'Loyalty rewards program',
        'Corporate rental programs available',
        'Special rates for groups and events',
        'Multi-city rental options',
    ];

    return (
        <CustomerLayout
            title="Our Services"
            description="Discover AutoRental's comprehensive car rental services. Professional drivers, airport transfers, and more."
        >
            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-4xl text-center">
                        {/* <Badge className="bg-white/20 text-white border-white/30 mb-6">
                            Our Services
                        </Badge> */}
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                            Complete Car Rental Solutions
                        </h1>
                        <p className="text-xl leading-relaxed text-blue-100">
                            From short trips to long-term rentals, we provide
                            comprehensive services to meet all your
                            transportation needs in Vietnam.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-b bg-white py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Car className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_cars}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Vehicles
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_drivers}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Professional Drivers
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_locations}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Locations
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <Award className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.years_in_business}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Years Experience
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Services */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Our Main Services
                            </h2>
                            <p className="text-lg text-gray-600">
                                Professional car rental solutions tailored to
                                your needs
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            {mainServices.map((service, index) => (
                                <Card
                                    key={index}
                                    className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                                >
                                    <CardHeader>
                                        <div
                                            className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${service.iconBg} mb-4`}
                                        >
                                            <service.icon
                                                className={`h-7 w-7 ${service.iconColor}`}
                                            />
                                        </div>
                                        <CardTitle className="text-2xl">
                                            {service.title}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {service.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {service.features.map(
                                                (feature, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                        <span className="text-gray-600">
                                                            {feature}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Services */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Additional Services & Benefits
                            </h2>
                            <p className="text-lg text-gray-600">
                                Everything you need for a seamless rental
                                experience
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {additionalServices.map((service, index) => (
                                <Card
                                    key={index}
                                    className="border-0 shadow-md"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                <service.icon className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="mb-2 font-bold text-gray-900">
                                                    {service.title}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {service.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Why Choose AutoRental
                            </h2>
                            <p className="text-lg text-gray-600">
                                We go the extra mile to ensure your satisfaction
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-lg bg-white p-4"
                                >
                                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600" />
                                    <span className="text-gray-700">
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                How It Works
                            </h2>
                            <p className="text-lg text-gray-600">
                                Renting a car is easy with our simple 4-step
                                process
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-4">
                            {[
                                {
                                    step: '1',
                                    title: 'Browse & Select',
                                    description:
                                        'Choose your perfect car from our fleet',
                                },
                                {
                                    step: '2',
                                    title: 'Book Online',
                                    description:
                                        'Complete your booking with instant confirmation',
                                },
                                {
                                    step: '3',
                                    title: 'Pick Up',
                                    description:
                                        'Collect your car at your chosen location',
                                },
                                {
                                    step: '4',
                                    title: 'Enjoy & Return',
                                    description:
                                        'Drive and return at the end of your rental',
                                },
                            ].map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white">
                                        {step.step}
                                    </div>
                                    <h3 className="mb-2 font-bold text-gray-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
             <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="mb-8 text-xl text-blue-100">
                            Browse our premium fleet and book your perfect car
                            today
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <a
                                href="/cars"
                                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl"
                            >
                                Browse Cars
                            </a>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </CustomerLayout>
    );
}
