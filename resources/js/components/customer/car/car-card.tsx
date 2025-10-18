import { Link } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currency';

interface CarCardProps {
    car: {
        id: number;
        name?: string | null;
        slug?: string;
        price_per_day?: number;
        daily_rate?: string;
        hourly_rate?: string;
        primary_image: string;
        average_rating?: number;
        reviews_count?: number;
        seats: number;
        transmission: 'manual' | 'automatic';
        fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
        is_featured?: boolean;
        category: { id: number; name: string };
        brand: { id: number; name: string };
    };
}

/**
 * CarCard Component
 * Premium car display card - clean, photo-focused design
 * Inspired by Turo - large image, minimal text, clear pricing
 */
export function CarCard({ car }: CarCardProps) {
    const carLink = car.slug ? `/cars/${car.slug}` : `/cars/${car.id}`;
    const displayPrice = car.price_per_day || parseFloat(car.daily_rate || '0');
    const hourlyPrice = car.hourly_rate ? parseFloat(car.hourly_rate) : null;

    return (
        <Link href={carLink}>
            <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Hero Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                    <img
                        src={car.primary_image || '/images/placeholder-car.jpg'}
                        alt={car.name || 'Car'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Image Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Featured Badge */}
                    {car.is_featured && (
                        <span className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-lg shadow-lg">
                            ⭐ Featured
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Category & Brand */}
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {car.category.name} · {car.brand.name}
                    </p>

                    {/* Car Name */}
                    <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {car.name}
                    </h3>

                    {/* Rating */}
                    {car.average_rating && car.average_rating > 0 ? (
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={
                                            i < Math.floor(car.average_rating || 0)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <span className="text-sm text-gray-600">({car.reviews_count || 0})</span>
                        </div>
                    ) : (
                        <div className="mb-4 text-sm text-gray-500">No reviews yet</div>
                    )}

                    {/* Simple Specs - Text Only */}
                    <div className="flex gap-3 text-sm text-gray-600 mb-4">
                        <span className="font-medium">{car.seats} seats</span>
                        <span className="text-gray-300">·</span>
                        <span className="capitalize font-medium">{car.transmission}</span>
                        <span className="text-gray-300">·</span>
                        <span className="capitalize font-medium">{car.fuel_type}</span>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                        {/* Daily Rate - Main */}
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                {formatCurrency(displayPrice)}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">/day</span>
                        </div>

                        {/* Hourly Rate - Secondary */}
                        {hourlyPrice && hourlyPrice > 0 && (
                            <div className="flex items-baseline gap-2">
                                <span className="text-base font-semibold text-gray-700">
                                    {formatCurrency(hourlyPrice)}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">/hour</span>
                            </div>
                        )}
                    </div>

                    {/* View Details Button - Full Width */}
                    <div className="flex items-center justify-center gap-2 text-blue-600 group-hover:text-blue-700 font-semibold text-sm group-hover:gap-3 transition-all">
                        <span>View details</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
