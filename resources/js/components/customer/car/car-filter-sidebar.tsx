import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface CarFilterSidebarProps {
    categories: Array<{ id: number; name: string }>;
    brands: Array<{ id: number; name: string }>;
    priceRange: { min: number; max: number };
    currentFilters: {
        category?: string | string[];
        brand?: string | string[];
        price_min?: number;
        price_max?: number;
        seats?: number;
        transmission?: string;
        fuel_type?: string | string[];
    };
}

/**
 * CarFilterSidebar Component
 * Professional filter panel without decorative icons
 * Clean, text-focused design inspired by Turo
 */
export function CarFilterSidebar({
    categories,
    brands,
    priceRange,
    currentFilters,
}: CarFilterSidebarProps) {
    const [selectedCategories, setSelectedCategories] = useState<number[]>(
        Array.isArray(currentFilters.category)
            ? currentFilters.category.map(Number)
            : currentFilters.category
              ? [Number(currentFilters.category)]
              : []
    );

    const [selectedBrands, setSelectedBrands] = useState<number[]>(
        Array.isArray(currentFilters.brand)
            ? currentFilters.brand.map(Number)
            : currentFilters.brand
              ? [Number(currentFilters.brand)]
              : []
    );

    const [priceValue, setPriceValue] = useState<number[]>([
        currentFilters.price_min || priceRange.min,
        currentFilters.price_max || priceRange.max,
    ]);

    const [selectedTransmission, setSelectedTransmission] = useState<string>(
        currentFilters.transmission || 'all'
    );

    const [selectedSeats, setSelectedSeats] = useState<string>(
        currentFilters.seats?.toString() || 'all'
    );

    const handleApplyFilters = () => {
        const filters: Record<string, string | number> = {};

        if (selectedCategories.length > 0) {
            filters.category = selectedCategories.join(',');
        }

        if (selectedBrands.length > 0) {
            filters.brand = selectedBrands.join(',');
        }

        if (priceValue[0] !== priceRange.min || priceValue[1] !== priceRange.max) {
            filters.price_min = priceValue[0];
            filters.price_max = priceValue[1];
        }

        if (selectedTransmission !== 'all') {
            filters.transmission = selectedTransmission;
        }

        if (selectedSeats !== 'all') {
            filters.seats = selectedSeats;
        }

        router.get('/cars', filters, { preserveState: true });
    };

    const handleReset = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceValue([priceRange.min, priceRange.max]);
        setSelectedTransmission('all');
        setSelectedSeats('all');
        router.get('/cars', {}, { preserveState: true });
    };

    const hasActiveFilters =
        selectedCategories.length > 0 ||
        selectedBrands.length > 0 ||
        priceValue[0] !== priceRange.min ||
        priceValue[1] !== priceRange.max ||
        selectedTransmission !== 'all' ||
        selectedSeats !== 'all';

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h3 className="font-semibold text-lg text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="text-sm text-blue-600 hover:text-blue-700"
                    >
                        Reset All
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`category-${category.id}`}
                                        checked={selectedCategories.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedCategories([
                                                    ...selectedCategories,
                                                    category.id,
                                                ]);
                                            } else {
                                                setSelectedCategories(
                                                    selectedCategories.filter(
                                                        (id) => id !== category.id
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={`category-${category.id}`}
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t pt-6" />

                {/* Brand Filter */}
                {brands.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Brand</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {brands.map((brand) => (
                                <div key={brand.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`brand-${brand.id}`}
                                        checked={selectedBrands.includes(brand.id)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedBrands([...selectedBrands, brand.id]);
                                            } else {
                                                setSelectedBrands(
                                                    selectedBrands.filter((id) => id !== brand.id)
                                                );
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={`brand-${brand.id}`}
                                        className="text-sm text-gray-700 cursor-pointer"
                                    >
                                        {brand.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t pt-6" />

                {/* Price Range Filter */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Price per Day</h4>
                    <div className="space-y-4">
                        <Slider
                            value={priceValue}
                            onValueChange={setPriceValue}
                            min={priceRange.min}
                            max={priceRange.max}
                            step={10}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>${priceValue[0]}</span>
                            <span>${priceValue[1]}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6" />

                {/* Transmission Filter */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Transmission</h4>
                    <RadioGroup value={selectedTransmission} onValueChange={setSelectedTransmission}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="all" id="transmission-all" />
                                <Label
                                    htmlFor="transmission-all"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    All
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="automatic" id="transmission-automatic" />
                                <Label
                                    htmlFor="transmission-automatic"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    Automatic
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="manual" id="transmission-manual" />
                                <Label
                                    htmlFor="transmission-manual"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    Manual
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                <div className="border-t pt-6" />

                {/* Seats Filter */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">Seats</h4>
                    <RadioGroup value={selectedSeats} onValueChange={setSelectedSeats}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="all" id="seats-all" />
                                <Label
                                    htmlFor="seats-all"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    All
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="2" id="seats-2" />
                                <Label
                                    htmlFor="seats-2"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    2-4 seats
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="5" id="seats-5" />
                                <Label
                                    htmlFor="seats-5"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    5-7 seats
                                </Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="8" id="seats-8" />
                                <Label
                                    htmlFor="seats-8"
                                    className="text-sm text-gray-700 cursor-pointer"
                                >
                                    8+ seats
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6 pt-6 border-t">
                <Button onClick={handleApplyFilters} className="w-full bg-blue-600 hover:bg-blue-700">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}
