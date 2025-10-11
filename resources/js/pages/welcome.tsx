import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Car, Clock, Shield, CheckCircle2 } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function Welcome() {
    const { auth, name } = usePage<SharedData>().props;

    const features = [
        {
            icon: Car,
            title: 'Wide Selection',
            description: '1,000+ premium vehicles to choose from',
        },
        {
            icon: Clock,
            title: 'Instant Booking',
            description: 'Book your perfect car in under 60 seconds',
        },
        {
            icon: Shield,
            title: '24/7 Support',
            description: 'Expert assistance whenever you need it',
        },
        {
            icon: CheckCircle2,
            title: 'Best Prices',
            description: 'Guaranteed lowest rates in Vietnam',
        },
    ];

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat" />
                </div>

                <header className="relative z-10 border-b border-zinc-800/50 backdrop-blur-sm">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-xl font-semibold text-white transition-transform hover:scale-105"
                            >
                                <AppLogoIcon className="size-8 fill-current text-white" />
                                <span>{name}</span>
                            </Link>

                            <nav className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={register()}
                                            className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-all hover:bg-zinc-200"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                <main className="relative z-10">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
                                Premium Car Rental
                                <br />
                                <span className="bg-gradient-to-r from-zinc-300 to-zinc-100 bg-clip-text text-transparent">
                                    in Vietnam
                                </span>
                            </h1>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300 sm:text-xl">
                                Experience the freedom of the road with our premium fleet. Choose from over 1,000 vehicles and book instantly with the best rates guaranteed.
                            </p>

                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-lg"
                                    >
                                        Go to Dashboard
                                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="group flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-lg"
                                        >
                                            Get Started
                                            <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={login()}
                                            className="rounded-lg border border-zinc-700 px-8 py-4 text-base font-semibold text-white transition-all hover:border-zinc-600 hover:bg-white/5"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-xl">
                                        <div className="mb-4 inline-flex rounded-lg bg-white/5 p-3">
                                            <Icon className="size-6 text-zinc-400 transition-colors group-hover:text-white" />
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 border-y border-zinc-800/50 py-12 sm:gap-16">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">5,000+</div>
                                <div className="mt-2 text-sm text-zinc-400">Happy Customers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">1,000+</div>
                                <div className="mt-2 text-sm text-zinc-400">Available Cars</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">4.9★</div>
                                <div className="mt-2 text-sm text-zinc-400">Customer Rating</div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 border-t border-zinc-800/50">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-sm text-zinc-400">
                                © {new Date().getFullYear()} {name}. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                <span>Trusted by thousands across Vietnam</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
