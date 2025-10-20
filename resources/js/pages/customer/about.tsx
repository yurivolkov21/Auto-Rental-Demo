import { Card, CardContent } from '@/components/ui/card';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import {
    Award,
    Car,
    CheckCircle2,
    Heart,
    MapPin,
    Star,
    Target,
    Users,
} from 'lucide-react';

interface AboutProps {
    stats: {
        years_in_business: number;
        total_cars: number;
        total_locations: number;
        happy_customers: number;
        total_bookings: number;
    };
    teamMembers: Array<{
        name: string;
        position: string;
        bio: string;
        image: string | null;
    }>;
}

export default function About({ stats, teamMembers }: AboutProps) {
    return (
        <CustomerLayout
            title="About Us"
            description="Learn about AutoRental - Vietnam's premier car rental service with premium vehicles and exceptional customer service"
        >
            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-4xl text-center">
                        {/* <Badge className="mb-6 border-white/30 bg-white/20 text-white">
                            About AutoRental
                        </Badge> */}
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                            Your Trusted Partner in Car Rental
                        </h1>
                        <p className="text-xl leading-relaxed text-blue-100">
                            Providing premium car rental services in Vietnam
                            since{' '}
                            {new Date().getFullYear() - stats.years_in_business}
                            . We are committed to delivering exceptional
                            experiences with quality vehicles and outstanding
                            customer service.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-b bg-white py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <Award className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.years_in_business}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Years in Business
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Car className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_cars}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Premium Cars
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
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.happy_customers.toLocaleString()}+
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Happy Customers
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Our Story
                            </h2>
                            <p className="text-lg text-gray-600">
                                Building trust through quality and service
                                excellence
                            </p>
                        </div>

                        <Card className="border-0 shadow-lg">
                            <CardContent className="p-8 md:p-10">
                                <div className="space-y-6 text-gray-600">
                                    <p className="text-lg leading-relaxed">
                                        Founded in{' '}
                                        {new Date().getFullYear() -
                                            stats.years_in_business}
                                        , AutoRental began with a simple vision:
                                        to make quality car rental accessible,
                                        affordable, and hassle-free for everyone
                                        in Vietnam. What started as a small
                                        fleet of vehicles has grown into one of
                                        the most trusted car rental services in
                                        the country.
                                    </p>
                                    <p className="text-lg leading-relaxed">
                                        Over the years, we've expanded our
                                        services across major cities and tourist
                                        destinations, always maintaining our
                                        commitment to quality, safety, and
                                        customer satisfaction. Our team works
                                        tirelessly to ensure every rental
                                        experience exceeds expectations.
                                    </p>
                                    <p className="text-lg leading-relaxed">
                                        Today, we're proud to serve thousands of
                                        customers annually, from business
                                        travelers and tourists to local families
                                        planning their next adventure. Our
                                        success is built on the trust our
                                        customers place in us, and we never take
                                        that for granted.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-8 md:grid-cols-3">
                            {/* Mission */}
                            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <Target className="h-7 w-7" />
                                    </div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                                        Our Mission
                                    </h3>
                                    <p className="leading-relaxed text-gray-600">
                                        To provide safe, reliable, and premium
                                        car rental services that empower our
                                        customers to explore Vietnam with
                                        confidence and comfort.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Vision */}
                            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                                        <Star className="h-7 w-7" />
                                    </div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                                        Our Vision
                                    </h3>
                                    <p className="leading-relaxed text-gray-600">
                                        To become Vietnam's most trusted and
                                        innovative car rental platform, setting
                                        new standards for quality and customer
                                        experience.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Values */}
                            <Card className="border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                <CardContent className="p-8">
                                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                        <Heart className="h-7 w-7" />
                                    </div>
                                    <h3 className="mb-4 text-xl font-bold text-gray-900">
                                        Our Values
                                    </h3>
                                    <p className="leading-relaxed text-gray-600">
                                        Integrity, transparency, and
                                        customer-first approach in everything we
                                        do. Building lasting relationships based
                                        on trust.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Why Choose AutoRental
                            </h2>
                            <p className="text-lg text-gray-600">
                                Experience the difference with our premium
                                service
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        Premium Vehicle Fleet
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        Wide selection of well-maintained,
                                        modern vehicles from top brands. All
                                        cars are regularly serviced and
                                        inspected for your safety.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        Transparent Pricing
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        No hidden fees. What you see is what you
                                        pay. Clear pricing with flexible rental
                                        options to suit your budget.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        24/7 Customer Support
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        Our dedicated support team is always
                                        available to assist you, whether it's
                                        booking help or roadside assistance.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        Flexible Booking
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        Easy online booking with instant
                                        confirmation. Flexible pickup and
                                        drop-off options across multiple
                                        locations.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        Professional Drivers Available
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        Optional professional driver service for
                                        your convenience and peace of mind
                                        during your journey.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="group border-0 shadow-md transition-all duration-300 hover:shadow-xl">
                                <CardContent className="p-6">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 transition-transform group-hover:scale-110">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="mb-3 text-lg font-bold text-gray-900">
                                        Comprehensive Insurance
                                    </h4>
                                    <p className="leading-relaxed text-gray-600">
                                        All rentals include comprehensive
                                        insurance coverage for your protection
                                        and peace of mind.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">
                                Meet Our Team
                            </h2>
                            <p className="text-lg text-gray-600">
                                Dedicated professionals committed to your
                                satisfaction
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {teamMembers.map((member, index) => (
                                <Card
                                    key={index}
                                    className="border-0 shadow-md transition-shadow duration-300 hover:shadow-lg"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                                            <Users className="h-12 w-12 text-blue-600" />
                                        </div>
                                        <h4 className="mb-1 font-bold text-gray-900">
                                            {member.name}
                                        </h4>
                                        <p className="mb-3 text-sm font-medium text-blue-600 uppercase">
                                            {member.position}
                                        </p>
                                        <p className="text-sm leading-relaxed text-gray-600">
                                            {member.bio}
                                        </p>
                                    </CardContent>
                                </Card>
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
