import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { CarImageGallery } from '@/components/customer/car/car-image-gallery';
import { CarSpecifications } from '@/components/customer/car/car-specifications';
import { BookingCalculator } from '@/components/customer/car/booking-calculator';
import { CarReviews } from '@/components/customer/car/car-reviews';
import { CarCard } from '@/components/customer/car/car-card';
import { Link } from '@inertiajs/react';

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
                                        <p className="text-sm text-gray-500 mb-1">Starting at</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${parseFloat(car.daily_rate).toLocaleString()}
                                            <span className="text-lg text-gray-500 font-normal">
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

                            {/* Features */}
                            {car.features && (
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Features & Amenities
                                    </h2>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {car.features}
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
