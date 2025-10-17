import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { CarCard } from '@/components/customer/car/car-card';
import { CarFilterSidebar } from '@/components/customer/car/car-filter-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface Car {
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
}

interface CarsIndexProps {
    cars: {
        data: Car[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories: Array<{ id: number; name: string; slug: string }>;
    brands: Array<{ id: number; name: string; slug: string }>;
    priceRange: { min: number; max: number };
    filters: {
        category?: string | string[];
        brand?: string | string[];
        price_min?: number;
        price_max?: number;
        seats?: number;
        transmission?: string;
        fuel_type?: string | string[];
        search?: string;
        sort_by?: string;
        sort_direction?: string;
    };
}

/**
 * Cars Index Page
 * Professional car listing with filters and sorting
 * Design inspired by Turo - clean, grid-based layout
 */
export default function CarsIndex({ cars, categories, brands, priceRange, filters }: CarsIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/cars', { ...filters, search: searchQuery }, { preserveState: true });
    };

    const handleSortChange = (value: string) => {
        const [sortBy, sortDirection] = value.split(':');
        router.get(
            '/cars',
            { ...filters, sort_by: sortBy, sort_direction: sortDirection },
            { preserveState: true }
        );
    };

    const currentSort = `${filters.sort_by || 'created_at'}:${filters.sort_direction || 'desc'}`;

    return (
        <CustomerLayout
            title="Browse Cars"
            description="Find the perfect car for your journey. Filter by category, brand, price and more."
        >
            {/* Header Section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Browse Cars
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        {cars.total} cars available for rent
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <Input
                            type="text"
                            placeholder="Search by car name or model..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                            Search
                        </Button>
                    </form>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar - Desktop */}
                        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
                            <CarFilterSidebar
                                categories={categories}
                                brands={brands}
                                priceRange={priceRange}
                                currentFilters={filters}
                            />
                        </aside>

                        {/* Mobile Filter Button */}
                        <div className="lg:hidden">
                            <Button
                                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                                variant="outline"
                                className="w-full"
                            >
                                {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                            {mobileFiltersOpen && (
                                <div className="mt-4">
                                    <CarFilterSidebar
                                        categories={categories}
                                        brands={brands}
                                        priceRange={priceRange}
                                        currentFilters={filters}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {/* Toolbar */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <p className="text-sm text-gray-600">
                                        Showing {cars.from}-{cars.to} of {cars.total} cars
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Sort by:</span>
                                        <Select value={currentSort} onValueChange={handleSortChange}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at:desc">
                                                    Newest First
                                                </SelectItem>
                                                <SelectItem value="price:asc">
                                                    Price: Low to High
                                                </SelectItem>
                                                <SelectItem value="price:desc">
                                                    Price: High to Low
                                                </SelectItem>
                                                <SelectItem value="rating:desc">
                                                    Highest Rated
                                                </SelectItem>
                                                <SelectItem value="popularity:desc">
                                                    Most Popular
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Cars Grid */}
                            {cars.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                        {cars.data.map((car) => (
                                            <CarCard key={car.id} car={car} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {cars.last_page > 1 && (
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                disabled={cars.current_page === 1}
                                                onClick={() =>
                                                    router.get(
                                                        '/cars',
                                                        { ...filters, page: cars.current_page - 1 },
                                                        { preserveState: true }
                                                    )
                                                }
                                            >
                                                Previous
                                            </Button>
                                            <span className="text-sm text-gray-600">
                                                Page {cars.current_page} of {cars.last_page}
                                            </span>
                                            <Button
                                                variant="outline"
                                                disabled={cars.current_page === cars.last_page}
                                                onClick={() =>
                                                    router.get(
                                                        '/cars',
                                                        { ...filters, page: cars.current_page + 1 },
                                                        { preserveState: true }
                                                    )
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                    <div className="max-w-md mx-auto">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            No cars found
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            Try adjusting your filters or search query to find more
                                            results.
                                        </p>
                                        <Button
                                            onClick={() =>
                                                router.get('/cars', {}, { preserveState: true })
                                            }
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
