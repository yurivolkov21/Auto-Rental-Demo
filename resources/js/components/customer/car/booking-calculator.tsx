import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';

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
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            {/* Price Header */}
            <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Daily rate</p>
                <p className="text-3xl font-bold text-gray-900">
                    ${parseFloat(dailyRate).toLocaleString()}
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
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                            ${dailyRateNum.toLocaleString()} × {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-medium text-gray-900">
                            ${subtotal.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee (5%)</span>
                        <span className="font-medium text-gray-900">
                            ${serviceFee.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">${total.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* CTA Button */}
            <Button
                onClick={handleBookNow}
                disabled={!pickupDate || !returnDate || !locationId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
                Book Now
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
                You won't be charged yet
            </p>
        </div>
    );
}
