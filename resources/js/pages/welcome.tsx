import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Car,
    Headphones,
    MapPin,
    Shield,
    Users,
} from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to AutoRental">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin=""
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
                {/* Navigation */}
                <nav className="absolute top-0 z-50 w-full bg-gradient-to-b from-black/80 to-transparent">
                    <div className="container mx-auto px-4">
                        <div className="flex h-20 items-center justify-between">
                            {/* Logo */}
                            <Link
                                href="/"
                                className="text-2xl font-bold text-white"
                            >
                                Auto<span className="text-gray-300">Rental</span>
                            </Link>

                            {/* Navigation Links */}
                            <div className="hidden items-center gap-8 md:flex">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-md bg-white px-6 py-2.5 font-medium text-black transition hover:bg-gray-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="font-medium text-white transition hover:text-gray-300"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-md bg-white px-6 py-2.5 font-medium text-black transition hover:bg-gray-200"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
                    </div>

                    <div className="container relative z-10 mx-auto px-4 text-center">
                        <div className="mx-auto max-w-4xl">
                            <h1 className="mb-6 animate-fade-in text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                                Rent A Car
                                <br />
                                <span className="text-gray-300">
                                    With Ease & Comfort
                                </span>
                            </h1>
                            <p className="mb-8 text-lg text-gray-400 md:text-xl">
                                Modern car rental platform in Vietnam.
                                Thousands of quality vehicles, transparent
                                pricing, book your car in minutes.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {!auth.user && (
                                    <>
                                        <Link
                                            href={register()}
                                            className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-black transition hover:bg-gray-200 hover:shadow-lg"
                                        >
                                            <Car className="h-5 w-5" />
                                            Get Started
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-600 bg-transparent px-8 py-4 text-lg font-semibold text-white transition hover:border-white hover:bg-white/10"
                                        >
                                            Log In
                                        </Link>
                                    </>
                                )}
                                {auth.user && (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-black transition hover:bg-gray-200 hover:shadow-lg"
                                    >
                                        Go to Dashboard
                                    </Link>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-gray-700 pt-8">
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        1000+
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        Available Cars
                                    </div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        5000+
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        Happy Customers
                                    </div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        50+
                                    </div>
                                    <div className="mt-2 text-sm text-gray-400">
                                        Locations
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="h-12 w-8 rounded-full border-2 border-gray-600">
                            <div className="mx-auto mt-2 h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Features
                            </span>
                            <h2 className="text-4xl font-bold text-black">
                                Why Choose Us?
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <MapPin className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    Multiple Locations
                                </h3>
                                <p className="text-gray-600">
                                    Pick up your car at multiple locations
                                    nationwide, convenient for your itinerary.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <Shield className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    Full Insurance
                                </h3>
                                <p className="text-gray-600">
                                    All vehicles are fully insured, ensuring safety
                                    for your trip.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <Calendar className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    Flexible Booking
                                </h3>
                                <p className="text-gray-600">
                                    Rent by hour, day or month. Free cancellation
                                    within 24 hours.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <Car className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    Wide Selection
                                </h3>
                                <p className="text-gray-600">
                                    From luxury cars to economy vehicles, we have it
                                    all to meet your needs.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <Users className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    Professional Drivers
                                </h3>
                                <p className="text-gray-600">
                                    Hire with professional drivers for a safe and
                                    comfortable journey.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="group rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-black hover:shadow-xl">
                                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-black group-hover:text-white">
                                    <Headphones className="h-7 w-7" />
                                </div>
                                <h3 className="mb-3 text-xl font-semibold text-black">
                                    24/7 Support
                                </h3>
                                <p className="text-gray-600">
                                    Our customer care team is always ready to assist
                                    you anytime, anywhere.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
