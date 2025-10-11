import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Car, Clock, Shield, Tag, CheckCircle2 } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name } = usePage<SharedData>().props;

    const features = [
        {
            icon: Car,
            title: 'Wide Selection',
            description: '100+ premium vehicles',
        },
        {
            icon: Clock,
            title: 'Instant Booking',
            description: 'Book in 60 seconds',
        },
        {
            icon: Shield,
            title: '24/7 Support',
            description: 'Always here to help',
        },
        {
            icon: Tag,
            title: 'Best Prices',
            description: 'Guaranteed lowest rates',
        },
    ];

    const stats = [
        { label: 'Happy Customers', value: '5,00+' },
        { label: 'Available Cars', value: '1,00+' },
        { label: 'Customer Rating', value: '4.9★' },
    ];

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-gradient-to-br from-black via-gray-900 to-black p-10 text-white lg:flex dark:border-r">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
                </div>

                {/* Logo & Brand */}
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-semibold transition-transform hover:scale-105"
                >
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white drop-shadow-lg" />
                    <span className="drop-shadow-md">{name}</span>
                </Link>

                {/* Main Content */}
                <div className="relative z-20 mt-auto flex flex-col gap-8">
                    {/* Hero Section */}
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold leading-tight drop-shadow-lg">
                            Premium Car Rental
                            <br />
                            <span className="bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                                in Vietnam
                            </span>
                        </h2>
                        <p className="text-lg text-gray-300 drop-shadow-md">
                            Experience the freedom of the road with our premium
                            fleet. Book instantly, drive confidently.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group rounded-lg border border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm transition-all hover:border-gray-700 hover:bg-gray-800/50 hover:shadow-lg"
                                >
                                    <Icon className="mb-2 size-6 text-gray-400 transition-transform group-hover:scale-110 group-hover:text-white" />
                                    <h3 className="text-sm font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Section */}
                    <div className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/50 p-4 backdrop-blur-sm">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust Badge */}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="size-5 text-emerald-500" />
                        <span>
                            Trusted by thousands of travelers across Vietnam
                        </span>
                    </div>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
