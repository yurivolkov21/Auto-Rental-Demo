import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { User } from '@/types/index.d';

/**
 * CustomerHeader Component
 * Professional, minimal header with sticky behavior
 * Design inspired by Turo/Enterprise - clean and elegant
 */
export function CustomerHeader() {
    const { props } = usePage();
    const auth = props.auth as { user: User | null };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigationLinks = [
        { name: 'Home', href: '/' },
        { name: 'Cars', href: '/cars' },
        { name: 'Locations', href: '/locations' },
        { name: 'Services', href: '/services' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900">
                            Auto<span className="text-blue-600">Rental</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navigationLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {auth.user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-blue-600"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            {mobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <nav className="flex flex-col gap-4">
                            {navigationLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-base font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t flex flex-col gap-3">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            className="text-base font-medium text-gray-700"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="text-base font-medium text-gray-700 text-left"
                                        >
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/login" className="text-base font-medium text-gray-700">
                                            Sign In
                                        </Link>
                                        <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                            <Link href="/register">Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
