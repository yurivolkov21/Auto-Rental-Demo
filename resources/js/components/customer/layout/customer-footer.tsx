import { Link } from '@inertiajs/react';

/**
 * CustomerFooter Component
 * Clean, professional footer without decorative icons
 * Design inspired by Enterprise/Hertz - text-focused and elegant
 */
export function CustomerFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                    {/* Column 1: Company Info */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-xl font-bold text-gray-900">
                                Auto<span className="text-blue-600">Rental</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            Premium car rental service in Vietnam. Experience comfort and reliability
                            with our wide range of vehicles.
                        </p>
                        <div className="flex gap-4 text-sm">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Facebook
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Instagram
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Twitter
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/cars"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Browse Cars
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/locations"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Our Locations
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/services"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium text-gray-900">Phone</p>
                                <p className="text-gray-600">+84 123 456 789</p>
                                <p className="text-xs text-gray-500 mt-1">Mon-Fri: 8AM-8PM</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-gray-600">info@autorental.vn</p>
                                <p className="text-xs text-gray-500 mt-1">24/7 Support</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Address</p>
                                <p className="text-gray-600">123 Nguyen Hue, District 1</p>
                                <p className="text-gray-600">Ho Chi Minh City, Vietnam</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Legal */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/terms"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/rental-agreement"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Rental Agreement
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cancellation"
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Cancellation Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t bg-gray-50 py-6">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                        <p>© {currentYear} AutoRental. All rights reserved.</p>
                        <p>Made with care in Vietnam</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
