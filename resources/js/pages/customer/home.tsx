import CustomerLayout from '@/layouts/customer-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { Car, Star } from 'lucide-react';
import type { Car as CarType, CarCategory, Promotion } from '@/types';

interface HomeProps {
    featuredCars: CarType[];
    categories: (CarCategory & { cars_count: number })[];
    activePromotions: Promotion[];
    locations: Array<{
        id: number;
        name: string;
        address: string | null;
        is_airport: boolean;
        is_popular: boolean;
    }>;
    stats: {
        total_cars: number;
        total_locations: number;
        happy_customers: number;
        total_bookings: number;
    };
    recentReviews: Array<{
        id: number;
        rating: number;
        comment: string;
        user: { name: string };
        car: { model: string; brand: { name: string } };
    }>;
}

export default function Home({
    featuredCars,
    categories,
    activePromotions,
    stats,
    recentReviews,
}: HomeProps) {
    return (
        <CustomerLayout title="AutoRental - Premium Car Rental Service in Vietnam">
            {/* Hero Section - Inspired by CarBook */}
            <section className="relative min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center py-20">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Fast & Easy Way To Rent A Car
                        </h1>
                        <p className="text-xl md:text-2xl mb-10 text-gray-200 leading-relaxed">
                            Experience premium car rental service in Vietnam. Choose from our wide
                            selection of vehicles and hit the road today.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                                asChild
                            >
                                <Link href="/cars">Browse Cars</Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-6 text-lg"
                                asChild
                            >
                                <Link href="/about">Learn More</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="py-12 bg-white border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                        <div>
                            <div className="text-5xl font-bold text-blue-600 mb-2">
                                {stats.total_cars}+
                            </div>
                            <p className="text-gray-600 font-medium">Cars Available</p>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-blue-600 mb-2">
                                {stats.total_locations}+
                            </div>
                            <p className="text-gray-600 font-medium">Locations</p>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-blue-600 mb-2">
                                {stats.happy_customers}+
                            </div>
                            <p className="text-gray-600 font-medium">Happy Customers</p>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-blue-600 mb-2">
                                {stats.total_bookings}+
                            </div>
                            <p className="text-gray-600 font-medium">Trips Completed</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Steps */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                            How it works
                        </p>
                        <h2 className="text-4xl font-bold">Better Way To Rent Your Perfect Car</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-5xl">📍</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Choose Your Pickup Location</h3>
                            <p className="text-gray-600">
                                Select from our convenient locations across Vietnam
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-5xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Select the Best Deal</h3>
                            <p className="text-gray-600">
                                Compare prices and choose the perfect car for your needs
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-600 flex items-center justify-center">
                                <span className="text-5xl">🚗</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Reserve Your Rental Car</h3>
                            <p className="text-gray-600">
                                Book instantly and get ready to drive away
                            </p>
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
                            asChild
                        >
                            <Link href="/cars">Reserve Your Perfect Car</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Cars - Inspired by CarBook Grid */}
            {featuredCars.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                What we offer
                            </p>
                            <h2 className="text-4xl font-bold">Featured Vehicles</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredCars.map((car) => (
                                <Card
                                    key={car.id}
                                    className="overflow-hidden hover:shadow-xl transition-shadow group"
                                >
                                    <Link href={`/cars/${car.id}`}>
                                        <div className="relative">
                                            {car.images?.[0] ? (
                                                <img
                                                    src={`/storage/${car.images[0].image_path}`}
                                                    alt={car.model}
                                                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                                    <Car className="h-20 w-20 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-5">
                                            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                                                {car.brand?.name} {car.model}
                                            </h3>
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="outline" className="text-xs">
                                                    {car.category?.name}
                                                </Badge>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {new Intl.NumberFormat('vi-VN').format(
                                                            Number(car.daily_rate)
                                                        )}{' '}
                                                        ₫
                                                    </div>
                                                    <div className="text-xs text-gray-500">/day</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                                    asChild
                                                >
                                                    <Link href={`/booking/${car.id}`}>Book Now</Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <Link href={`/cars/${car.id}`}>Details</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                        <div className="text-center mt-10">
                            <Button size="lg" variant="outline" className="px-8 py-6 text-lg" asChild>
                                <Link href="/cars">View All Cars</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* Special Offers */}
            {activePromotions.length > 0 && (
                <section className="py-16 bg-blue-600 text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-3">Special Offers</h2>
                            <p className="text-xl text-blue-100">
                                Save more with our exclusive deals and promotions
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {activePromotions.map((promo) => (
                                <Card
                                    key={promo.id}
                                    className="bg-white text-gray-900 hover:shadow-2xl transition-all"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="mb-4">
                                            <Badge className="text-2xl px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white">
                                                {promo.discount_type === 'percentage'
                                                    ? `${promo.discount_value}% OFF`
                                                    : `${new Intl.NumberFormat('vi-VN').format(
                                                          Number(promo.discount_value)
                                                      )} ₫ OFF`}
                                            </Badge>
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">{promo.name}</h3>
                                        <p className="text-gray-600 mb-4">{promo.description}</p>
                                        <div className="pt-4 border-t">
                                            <p className="text-sm text-gray-500 mb-1">Promo Code</p>
                                            <p className="text-xl font-bold font-mono text-blue-600">
                                                {promo.code}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Grid */}
            {categories.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                Vehicle Types
                            </p>
                            <h2 className="text-4xl font-bold">Browse by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
                            {categories.map((category) => (
                                <Link key={category.id} href={`/cars?category=${category.id}`}>
                                    <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full text-center group">
                                        <CardContent className="pt-8 pb-6">
                                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                                {category.icon || '🚗'}
                                            </div>
                                            <h3 className="font-bold mb-1 group-hover:text-blue-600 transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                {category.cars_count} vehicles
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Customer Reviews */}
            {recentReviews.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">
                                Testimonials
                            </p>
                            <h2 className="text-4xl font-bold">What Our Customers Say</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {recentReviews.slice(0, 6).map((review) => (
                                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6 pb-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-5 w-5 ${
                                                        i < review.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'fill-gray-200 text-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 mb-4 italic leading-relaxed">
                                            "{review.comment}"
                                        </p>
                                        <div className="flex items-center gap-3 pt-4 border-t">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="font-bold text-blue-600 text-lg">
                                                    {review.user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold">{review.user.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {review.car.brand.name} {review.car.model}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto">
                        Browse our extensive fleet and book your perfect car today. Fast, easy, and
                        reliable.
                    </p>
                    <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-6 text-xl font-bold"
                        asChild
                    >
                        <Link href="/cars">Explore Our Cars</Link>
                    </Button>
                </div>
            </section>
        </CustomerLayout>
    );
}
