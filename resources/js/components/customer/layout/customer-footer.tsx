import { Link } from '@inertiajs/react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Company Info */}
                    <div>
                        <Link href="/" className="font-bold text-xl mb-4 block">
                            <span>AutoRental</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-4">
                            Premium car rental service in Vietnam. Experience comfort and reliability
                            with our wide range of vehicles.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/cars"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Browse Cars
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/locations"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Our Locations
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/about"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p>+84 123 456 789</p>
                                    <p className="text-xs">Mon-Fri: 8AM-8PM</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p>info@autorental.vn</p>
                                    <p className="text-xs">24/7 Support</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p>123 Nguyen Hue, District 1</p>
                                    <p className="text-xs">Ho Chi Minh City, Vietnam</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 className="font-semibold mb-4">Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to get special offers and updates.
                        </p>
                        <form className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-background"
                            />
                            <Button type="submit" className="w-full">
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <p>© {currentYear} AutoRental. All rights reserved.</p>
                        <div className="flex gap-4">
                            <Link
                                href="/terms"
                                className="hover:text-primary transition-colors"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/privacy"
                                className="hover:text-primary transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/rental-agreement"
                                className="hover:text-primary transition-colors"
                            >
                                Rental Agreement
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
