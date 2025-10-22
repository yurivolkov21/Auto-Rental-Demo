import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge } from './booking-status-badge';
import { formatCurrency } from '@/lib/currency';
import { Calendar, MapPin, Eye } from 'lucide-react';

interface BookingCardProps {
    booking: {
        id: number;
        booking_code: string;
        status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
        pickup_datetime: string;
        return_datetime: string;
        total_amount: string;
        car: {
            id: number;
            name: string;
            brand: { name: string };
            category: { name: string };
            primary_image: string;
        };
        pickup_location: {
            name: string;
        };
        return_location?: {
            name: string;
        };
    };
}

export function BookingCard({ booking }: BookingCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Car Image */}
                    <div className="sm:w-48 sm:h-48 h-40 relative overflow-hidden">
                        <img
                            src={booking.car.primary_image}
                            alt={booking.car.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} />
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                {/* Car Info */}
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {booking.car.brand.name} {booking.car.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {booking.car.category.name}
                                </p>

                                {/* Booking Code */}
                                <p className="text-sm text-gray-500 mb-4">
                                    Booking: <span className="font-medium text-gray-900">{booking.booking_code}</span>
                                </p>

                                {/* Dates & Location */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                Pickup: {formatDate(booking.pickup_datetime)}
                                            </div>
                                            <div className="font-medium text-gray-900">
                                                Return: {formatDate(booking.return_datetime)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{booking.pickup_location.name}</span>
                                        {booking.return_location && booking.return_location.name !== booking.pickup_location.name && (
                                            <span>→ {booking.return_location.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex flex-col items-end gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                        {formatCurrency(parseFloat(booking.total_amount))}
                                    </div>
                                </div>
                                <Link href={`/customer/bookings/${booking.id}`}>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
