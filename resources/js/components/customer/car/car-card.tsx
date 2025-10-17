import { Link } from '@inertiajs/react';

interface CarCardProps {
    car: {
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

    return (
        <Link href={carLink}>
            <div className="group bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
                {/* Hero Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={car.primary_image || '/images/placeholder-car.jpg'}
                        alt={car.name || 'Car'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Featured Badge */}
                    {car.is_featured && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-black/80 text-white text-xs font-medium rounded-md">
                            Featured
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Category & Brand */}
                    <p className="text-sm text-gray-500 mb-1">
                        {car.category.name} · {car.brand.name}
                    </p>

                    {/* Car Name */}
                    <h3 className="font-semibold text-lg mb-3 text-gray-900 line-clamp-1">
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
                    <div className="flex gap-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                        <span>{car.seats} seats</span>
                        <span>·</span>
                        <span>{car.transmission}</span>
                        <span>·</span>
                        <span>{car.fuel_type}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline justify-between">
                        <div>
                            <span className="text-2xl font-bold text-gray-900">
                                ${displayPrice}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">/day</span>
                        </div>
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                            View details →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
