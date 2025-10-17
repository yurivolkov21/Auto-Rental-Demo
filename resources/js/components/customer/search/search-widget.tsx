import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';

interface Location {
    id: number;
    name: string;
    address: string | null;
    is_airport: boolean;
    is_popular: boolean;
}

interface SearchWidgetProps {
    locations: Location[];
    className?: string;
}

/**
 * SearchWidget Component
 * Clean search form for hero section
 * Professional design - no decorative icons, clear inputs
 */
export function SearchWidget({ locations, className = '' }: SearchWidgetProps) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [pickupLocation, setPickupLocation] = useState('');
    const [pickupDate, setPickupDate] = useState(today);
    const [returnDate, setReturnDate] = useState(tomorrow);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!pickupLocation || !pickupDate || !returnDate) {
            alert('Please fill in all fields');
            return;
        }

        // Navigate to cars listing with search params
        router.get('/cars', {
            location: pickupLocation,
            pickup_date: pickupDate,
            return_date: returnDate,
        });
    };

    return (
        <div className={`bg-white rounded-2xl shadow-2xl p-6 md:p-8 ${className}`}>
            <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    {/* Pickup Location */}
                    <div className="space-y-2">
                        <Label htmlFor="pickupLocation" className="text-sm font-medium text-gray-700">
                            Pickup Location
                        </Label>
                        <select
                            id="pickupLocation"
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            aria-label="Select pickup location"
                        >
                            <option value="">Select location</option>
                            {locations
                                .filter((loc) => loc.is_popular)
                                .map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                        {location.is_airport ? ' (Airport)' : ''}
                                    </option>
                                ))}
                            {locations.filter((loc) => loc.is_popular).length > 0 &&
                                locations.filter((loc) => !loc.is_popular).length > 0 && (
                                    <option disabled>───────────</option>
                                )}
                            {locations
                                .filter((loc) => !loc.is_popular)
                                .map((location) => (
                                    <option key={location.id} value={location.id}>
                                        {location.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Pickup Date */}
                    <div className="space-y-2">
                        <Label htmlFor="pickupDate" className="text-sm font-medium text-gray-700">
                            Pickup Date
                        </Label>
                        <input
                            type="date"
                            id="pickupDate"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            min={today}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            aria-label="Select pickup date"
                        />
                    </div>

                    {/* Return Date */}
                    <div className="space-y-2">
                        <Label htmlFor="returnDate" className="text-sm font-medium text-gray-700">
                            Return Date
                        </Label>
                        <input
                            type="date"
                            id="returnDate"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            min={pickupDate || today}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                            aria-label="Select return date"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 opacity-0 hidden md:block">
                            Search
                        </Label>
                        <Button
                            type="submit"
                            className="w-full h-12 md:h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all shadow-lg hover:shadow-xl"
                        >
                            Search Cars
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {locations.length}+
                            </p>
                            <p className="text-sm text-gray-600">Locations</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">100+</p>
                            <p className="text-sm text-gray-600">Cars Available</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">24/7</p>
                            <p className="text-sm text-gray-600">Support</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
