import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { CarImageGallery } from '@/components/customer/car/car-image-gallery';
import { CarSpecifications } from '@/components/customer/car/car-specifications';
import { BookingCalculator } from '@/components/customer/car/booking-calculator';
import { CarReviews } from '@/components/customer/car/car-reviews';
import { CarCard } from '@/components/customer/car/car-card';
import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currency';

interface CarImage {
    id: number;
    image_url: string;
    is_primary: boolean;
    display_order?: number;
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: {
        name: string;
        profile_photo?: string;
    };
}

interface CarData {
    id: number;
    name: string;
    model: string;
    color: string;
    year: number;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    odometer_km: number;
    description: string;
    features: string;
    daily_rate: string;
    hourly_rate: string;
    deposit_amount: string;
    is_delivery_available: boolean;
    delivery_fee_per_km: string;
    // Add missing pricing fields
    overtime_fee_per_hour: string;
    min_rental_hours: number;
    daily_hour_threshold: number;
    max_delivery_distance?: number | null;
    // Existing fields
    primary_image: string;
    average_rating: number;
    reviews_count: number;
    rental_count: number;
    category: { id: number; name: string };
    brand: { id: number; name: string };
    location: { id: number; name: string; address: string };
    images: CarImage[];
    reviews: Review[];
    doors?: number;
    luggage_capacity?: number;
}

interface RelatedCar {
    id: number;
    name: string | null;
    slug?: string;
    price_per_day?: number;
    daily_rate?: string;
    primary_image: string;
    average_rating?: number;
    reviews_count?: number;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    category: { id: number; name: string };
    brand: { id: number; name: string };
}

interface Location {
    id: number;
    name: string;
    address: string;
}

interface CarShowProps {
    car: CarData;
    relatedCars: RelatedCar[];
    availableLocations: Location[];
}

/**
 * Car Detail Page
 * Full car showcase with gallery, specs, booking widget, reviews
 * Professional layout inspired by Turo/Airbnb
 */
export default function CarShow({ car, relatedCars, availableLocations }: CarShowProps) {
    const carSpecsData = {
        seats: car.seats,
        transmission: car.transmission,
        fuel_type: car.fuel_type,
        year: car.year,
        mileage: car.odometer_km,
        license_plate: car.model, // Using model as placeholder
        color: car.color,
        doors: car.doors,
        luggage_capacity: car.luggage_capacity,
    };

    const imagesWithOrder = car.images.map((img, index) => ({
        ...img,
        display_order: img.display_order || index,
    }));

    // Parse features JSON safely
    const parseFeatures = (): Record<string, boolean> => {
        if (!car.features) return {};
        try {
            return typeof car.features === 'string'
                ? JSON.parse(car.features)
                : car.features;
        } catch {
            return {};
        }
    };

    const featuresObj = parseFeatures();
    const activeFeatures = Object.entries(featuresObj)
        .filter(([, value]) => value === true)
        .map(([key]) => ({
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        }));

    return (
        <CustomerLayout
            title={`${car.brand.name} ${car.name}`}
            description={car.description}
        >
            <div className="bg-gray-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <nav className="flex items-center gap-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-blue-600">
                                Home
                            </Link>
                            <span>/</span>
                            <Link href="/cars" className="hover:text-blue-600">
                                Cars
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{car.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Main Content */}
                        <div className="flex-1 space-y-8">
                            {/* Car Header */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {car.brand.name} {car.name}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>{car.category.name}</span>
                                            <span>•</span>
                                            <span>{car.year}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="font-medium text-gray-900">
                                                    {car.average_rating.toFixed(1)}
                                                </span>
                                                <span>({car.reviews_count} reviews)</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-2">Rental Rates</p>

                                        {/* Hourly Rate */}
                                        {car.hourly_rate && parseFloat(car.hourly_rate) > 0 && (
                                            <p className="text-lg font-semibold text-gray-700 mb-1">
                                                {formatCurrency(parseFloat(car.hourly_rate))}
                                                <span className="text-sm text-gray-500 font-normal"> /hour</span>
                                            </p>
                                        )}

                                        {/* Daily Rate - Main */}
                                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                            {formatCurrency(parseFloat(car.daily_rate))}
                                            <span className="text-lg text-gray-500 font-normal ml-1">
                                                /day
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Location Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm">
                                    <svg
                                        className="w-4 h-4 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span className="text-gray-700">{car.location.name}</span>
                                </div>
                            </div>

                            {/* Image Gallery */}
                            <CarImageGallery images={imagesWithOrder} carName={car.name} />

                            {/* Description */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    About this car
                                </h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {car.description}
                                </p>
                            </div>

                            {/* Specifications */}
                            <CarSpecifications car={carSpecsData} />

                            {/* Complete Pricing Information */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Pricing & Fees
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Rental Rates */}
                                    <div className="space-y-3">
                                        <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
                                            Rental Rates
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-600">Hourly Rate</span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(parseFloat(car.hourly_rate))}
                                                    <span className="text-xs text-gray-500 ml-1">/hour</span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-600">Daily Rate</span>
                                                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                                    {formatCurrency(parseFloat(car.daily_rate))}
                                                    <span className="text-xs text-gray-500 ml-1">/day</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                💡 Rentals of {car.daily_hour_threshold}+ hours automatically convert to daily rate
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional Fees */}
                                    <div className="space-y-3">
                                        <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
                                            Additional Fees
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-600">Security Deposit</span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(parseFloat(car.deposit_amount))}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-gray-600">Late Return Fee</span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(parseFloat(car.overtime_fee_per_hour))}
                                                    <span className="text-xs text-gray-500 ml-1">/hour</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                ℹ️ Security deposit refunded after inspection
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rental Constraints */}
                                    <div className="col-span-full mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h3 className="font-medium text-blue-900 text-sm mb-2">
                                            Rental Requirements
                                        </h3>
                                        <ul className="space-y-1 text-sm text-blue-800">
                                            <li>• Minimum rental: {car.min_rental_hours} hours</li>
                                            <li>• Daily rate applies for rentals {car.daily_hour_threshold}+ hours</li>
                                            <li>• Late returns charged at {formatCurrency(parseFloat(car.overtime_fee_per_hour))}/hour</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Information */}
                            {car.is_delivery_available && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                                Delivery Service Available
                                            </h2>
                                            <p className="text-gray-600 text-sm">
                                                We can deliver this car to your preferred location
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span className="font-medium text-gray-900">Delivery Fee</span>
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {parseFloat(car.delivery_fee_per_km) === 0 ? (
                                                    <span className="text-green-600">FREE</span>
                                                ) : (
                                                    <>
                                                        {formatCurrency(parseFloat(car.delivery_fee_per_km))}
                                                        <span className="text-sm font-normal text-gray-500 ml-1">/km</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>

                                        {car.max_delivery_distance && (
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                    </svg>
                                                    <span className="font-medium text-gray-900">Max Distance</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {car.max_delivery_distance} km
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <p className="text-sm text-blue-800">
                                            💡 <strong>Tip:</strong> Delivery fee calculated during checkout based on distance from {car.location.name}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Features - Enhanced with Tags */}
                            {activeFeatures.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Features & Amenities
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {activeFeatures.map((feature) => (
                                            <div
                                                key={feature.key}
                                                className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                                            >
                                                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="text-sm font-medium text-blue-900">
                                                    {feature.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <CarReviews
                                reviews={car.reviews}
                                averageRating={car.average_rating}
                                totalReviews={car.reviews_count}
                            />

                            {/* Related Cars */}
                            {relatedCars.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Similar Cars
                                        </h2>
                                        <Link
                                            href={`/cars?category=${car.category.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {relatedCars.map((relatedCar) => (
                                            <CarCard key={relatedCar.id} car={relatedCar} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Booking Calculator (Sticky) */}
                        <aside className="lg:w-96 flex-shrink-0">
                            <BookingCalculator
                                carId={car.id}
                                dailyRate={car.daily_rate}
                                availableLocations={availableLocations}
                            />
                        </aside>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
