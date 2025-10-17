interface Car {
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    year: number;
    mileage: number;
    license_plate: string;
    color: string;
    doors?: number;
    luggage_capacity?: number;
}

interface CarSpecificationsProps {
    car: Car;
}

/**
 * Car Specifications Table
 * Clean two-column specification list
 * Professional typography with proper spacing
 */
export function CarSpecifications({ car }: CarSpecificationsProps) {
    const specs = [
        { label: 'Seats', value: `${car.seats} passengers` },
        { label: 'Transmission', value: car.transmission === 'automatic' ? 'Automatic' : 'Manual' },
        {
            label: 'Fuel Type',
            value:
                car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1).replace('_', ' '),
        },
        { label: 'Year', value: car.year },
        { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
        { label: 'Color', value: car.color },
        { label: 'License Plate', value: car.license_plate },
    ];

    if (car.doors) {
        specs.push({ label: 'Doors', value: `${car.doors} doors` });
    }

    if (car.luggage_capacity) {
        specs.push({ label: 'Luggage', value: `${car.luggage_capacity} pieces` });
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Specifications</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {specs.map((spec) => (
                    <div key={spec.label} className="flex flex-col">
                        <dt className="text-sm text-gray-500 mb-1">{spec.label}</dt>
                        <dd className="text-base font-medium text-gray-900">{spec.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
