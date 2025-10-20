import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import {
    Building2,
    Car,
    Clock,
    Filter,
    Mail,
    MapPin,
    Navigation,
    Phone,
    Plane,
    Search,
    Star,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Location {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
    phone: string | null;
    email: string | null;
    opening_time: string | null;
    closing_time: string | null;
    is_24_7: boolean;
    is_airport: boolean;
    is_popular: boolean;
    available_cars: number;
}

interface LocationsProps {
    locations: Location[];
    stats: {
        total_locations: number;
        airport_locations: number;
        popular_locations: number;
        total_cars: number;
    };
}

export default function Locations({ locations, stats }: LocationsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<
        'all' | 'airport' | 'popular'
    >('all');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(
        null,
    );

    // Filter locations based on search and filters
    const filteredLocations = useMemo(() => {
        let filtered = locations;

        // Apply type filter
        if (selectedFilter === 'airport') {
            filtered = filtered.filter((loc) => loc.is_airport);
        } else if (selectedFilter === 'popular') {
            filtered = filtered.filter((loc) => loc.is_popular);
        }

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (loc) =>
                    loc.name.toLowerCase().includes(query) ||
                    loc.address?.toLowerCase().includes(query) ||
                    loc.description?.toLowerCase().includes(query),
            );
        }

        return filtered;
    }, [locations, searchQuery, selectedFilter]);

    const formatTime = (time: string | null) => {
        if (!time) return '';
        return time.substring(0, 5); // HH:MM
    };

    return (
        <CustomerLayout
            title="Our Locations"
            description="Find AutoRental locations across Vietnam. Convenient pickup and drop-off points nationwide."
        >
            {/* Hero Section */}
            <section className="relative flex min-h-[400px] items-center bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4 py-16">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                            Find Us Across Vietnam
                        </h1>
                        <p className="text-xl leading-relaxed text-blue-100">
                            Convenient pickup and drop-off points at major
                            cities and airports. Your perfect car is always
                            nearby.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="border-b bg-white py-12">
                <div className="container mx-auto px-4">
                    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_locations}
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Locations
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                <Plane className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.airport_locations}
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Airports
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                <Star className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.popular_locations}
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Popular
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Car className="h-6 w-6" />
                            </div>
                            <div className="mb-1 text-3xl font-bold text-gray-900">
                                {stats.total_cars}
                            </div>
                            <div className="text-sm text-gray-600 uppercase">
                                Cars Ready
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search & Filter Section */}
            <section className="border-b bg-white py-8">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-6xl">
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by city, address, or location name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 border-gray-200 pr-4 pl-12 text-base shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedFilter('all')}
                                    className={`group relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                                        selectedFilter === 'all'
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <span>All Locations</span>
                                        <Badge
                                            className={`ml-1 ${
                                                selectedFilter === 'all'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-gray-200 text-gray-700'
                                            }`}
                                        >
                                            {locations.length}
                                        </Badge>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedFilter('airport')}
                                    className={`group relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                                        selectedFilter === 'airport'
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Plane className="h-4 w-4" />
                                        <span>Airports</span>
                                        <Badge
                                            className={`ml-1 ${
                                                selectedFilter === 'airport'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}
                                        >
                                            {
                                                locations.filter(
                                                    (loc) => loc.is_airport,
                                                ).length
                                            }
                                        </Badge>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedFilter('popular')}
                                    className={`group relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                                        selectedFilter === 'popular'
                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4" />
                                        <span>Popular</span>
                                        <Badge
                                            className={`ml-1 ${
                                                selectedFilter === 'popular'
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}
                                        >
                                            {
                                                locations.filter(
                                                    (loc) => loc.is_popular,
                                                ).length
                                            }
                                        </Badge>
                                    </div>
                                </button>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">
                                        {filteredLocations.length}
                                    </span>
                                    <span>
                                        {filteredLocations.length === 1
                                            ? 'location'
                                            : 'locations'}{' '}
                                        found
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Locations Grid */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-7xl">
                        {filteredLocations.length === 0 ? (
                            <div className="py-16 text-center">
                                <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                    No locations found
                                </h3>
                                <p className="text-gray-600">
                                    Try adjusting your search or filters to find
                                    locations.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredLocations.map((location) => (
                                    <Card
                                        key={location.id}
                                        className={`group cursor-pointer overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                                            selectedLocation?.id === location.id
                                                ? 'ring-2 ring-blue-500'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedLocation(location)
                                        }
                                    >
                                        {/* Card Header with Gradient */}
                                        <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>

                                        <CardHeader className="pb-4">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                                                        {location.name}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap gap-2">
                                                        {location.is_airport && (
                                                            <Badge className="border-purple-200 bg-purple-50 text-purple-700">
                                                                <Plane className="mr-1 h-3 w-3" />
                                                                Airport
                                                            </Badge>
                                                        )}
                                                        {location.is_popular && (
                                                            <Badge className="border-orange-200 bg-orange-50 text-orange-700">
                                                                <Star className="mr-1 h-3 w-3" />
                                                                Popular
                                                            </Badge>
                                                        )}
                                                        {location.is_24_7 && (
                                                            <Badge className="border-green-200 bg-green-50 text-green-700">
                                                                <Clock className="mr-1 h-3 w-3" />
                                                                24/7
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform group-hover:scale-110">
                                                    <MapPin className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>

                                            {location.description && (
                                                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                                                    {location.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            {/* Address */}
                                            {location.address && (
                                                <div className="flex items-start gap-3">
                                                    <Navigation className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                                    <p className="flex-1 text-sm text-gray-600">
                                                        {location.address}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Operating Hours */}
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    {location.is_24_7 ? (
                                                        <span className="font-medium text-green-600">
                                                            Open 24/7
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {formatTime(
                                                                location.opening_time,
                                                            )}{' '}
                                                            -{' '}
                                                            {formatTime(
                                                                location.closing_time,
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Available Cars */}
                                            <div className="flex items-center gap-3 border-t pt-2">
                                                <Car className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {location.available_cars}{' '}
                                                    cars available
                                                </p>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {location.phone && (
                                                    <a
                                                        href={`tel:${location.phone}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Phone className="h-3 w-3" />
                                                        Call
                                                    </a>
                                                )}
                                                {location.email && (
                                                    <a
                                                        href={`mailto:${location.email}`}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <Mail className="h-3 w-3" />
                                                        Email
                                                    </a>
                                                )}
                                                {location.latitude &&
                                                    location.longitude && (
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
                                                            onClick={(e) =>
                                                                e.stopPropagation()
                                                            }
                                                        >
                                                            <Navigation className="h-3 w-3" />
                                                            Directions
                                                        </a>
                                                    )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
             <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 py-16 text-white">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 container mx-auto px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="mb-8 text-xl text-blue-100">
                            Browse our premium fleet and book your perfect car
                            today
                        </p>
                        <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <a
                                href="/cars"
                                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl"
                            >
                                Browse Cars
                            </a>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-white/10"
                            >
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </CustomerLayout>
    );
}
