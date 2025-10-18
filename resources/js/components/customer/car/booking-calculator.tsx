import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { formatCurrency } from '@/lib/currency';

interface BookingCalculatorProps {
    carId: number;
    dailyRate: string;
    availableLocations: Array<{ id: number; name: string }>;
}

/**
 * Booking Calculator Widget
 * Sticky sidebar widget for quick booking
 * Shows price calculation and CTA
 */
export function BookingCalculator({ carId, dailyRate, availableLocations }: BookingCalculatorProps) {
    const [pickupDate, setPickupDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [locationId, setLocationId] = useState(availableLocations[0]?.id.toString() || '');

    const calculateDays = () => {
        if (!pickupDate || !returnDate) return 0;
        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diff = end.getTime() - start.getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const days = calculateDays();
    const dailyRateNum = parseFloat(dailyRate);
    const subtotal = days * dailyRateNum;
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + serviceFee;

    const handleBookNow = () => {
        if (!pickupDate || !returnDate || !locationId) {
            alert('Please fill in all fields');
            return;
        }

        // Navigate to checkout with query params
        router.get('/booking/checkout', {
            car_id: carId,
            pickup_date: pickupDate,
            return_date: returnDate,
            pickup_location_id: locationId,
            return_location_id: locationId,
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24 shadow-lg">
            {/* Price Header */}
            <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Daily rate</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {formatCurrency(parseFloat(dailyRate))}
                    <span className="text-lg text-gray-500 font-normal">/day</span>
                </p>
            </div>

            {/* Booking Form */}
            <div className="space-y-4 mb-6">
                <div>
                    <Label htmlFor="location">Pickup Location</Label>
                    <select
                        id="location"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select pickup location"
                    >
                        {availableLocations.map((location) => (
                            <option key={location.id} value={location.id}>
                                {location.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                    <Input
                        id="pickupDate"
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="returnDate">Return Date</Label>
                    <Input
                        id="returnDate"
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className="mt-1"
                    />
                </div>
            </div>

            {/* Price Breakdown */}
            {days > 0 && (
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            {formatCurrency(dailyRateNum)} × {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-semibold text-gray-900">
                            {formatCurrency(subtotal)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee (5%)</span>
                        <span className="font-semibold text-gray-900">
                            {formatCurrency(serviceFee)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold pt-4 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-2xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <Button
                onClick={handleBookNow}
                disabled={!pickupDate || !returnDate || !locationId}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
                Book Now
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
                ✓ You won't be charged yet
            </p>
        </div>
    );
}
