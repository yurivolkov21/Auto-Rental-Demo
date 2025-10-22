import { useState, useEffect } from 'react';
import { CustomerLayout } from '@/layouts/customer/customer-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatCurrency } from '@/lib/currency';

interface Car {
    id: number;
    name: string;
    model: string;
    brand: { id: number; name: string };
    category: { id: number; name: string };
    daily_rate: string;
    primary_image: string;
    seats: number;
    transmission: string;
    fuel_type: string;
}

interface Location {
    id: number;
    name: string;
    address: string;
    is_airport: boolean;
    is_popular: boolean;
}

interface Driver {
    id: number;
    name: string;
    daily_rate: string;
    languages: string[];
    rating: number;
}

interface Pricing {
    base_price: number;
    driver_fee?: number;
    discount?: number;
    tax?: number;
    total: number;
}

interface BookingDetails {
    car_id: number;
    pickup_date: string;
    return_date: string;
    pickup_location_id: number;
    return_location_id: number;
}

interface CheckoutProps {
    car: Car;
    locations: Location[];
    drivers: Driver[];
    initialPricing: Pricing;
    bookingDetails: BookingDetails;
}

type Step = 1 | 2;

/**
 * Booking Checkout Page - 2 Steps (Simplified for Auth Users)
 * Step 1: Booking Details (dates, locations, driver, promo)
 * Step 2: Review & Confirm (payment method, special requests, submit)
 */
export default function BookingCheckout({
    car,
    locations,
    drivers,
    initialPricing,
    bookingDetails,
}: CheckoutProps) {
    const { auth } = usePage<{ auth: { user: { name: string; email: string; phone: string } } }>().props;
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [pricing, setPricing] = useState<Pricing>(initialPricing);
    const [isCalculating, setIsCalculating] = useState(false);

    // Step 1: Booking Details
    const [pickupDatetime, setPickupDatetime] = useState(
        `${bookingDetails.pickup_date}T09:00`
    );
    const [returnDatetime, setReturnDatetime] = useState(
        `${bookingDetails.return_date}T18:00`
    );
    const [pickupLocationId, setPickupLocationId] = useState(
        bookingDetails.pickup_location_id.toString()
    );
    const [returnLocationId, setReturnLocationId] = useState(
        bookingDetails.return_location_id.toString()
    );
    const [selectedDriverId, setSelectedDriverId] = useState<string>('');
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoMessage, setPromoMessage] = useState('');

    // Step 2: Payment & Requests
    const [specialRequests, setSpecialRequests] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    const [acceptTerms, setAcceptTerms] = useState(false);

    // Recalculate pricing when inputs change
    useEffect(() => {
        const calculatePricing = async () => {
            setIsCalculating(true);
            try {
                const response = await axios.post('/booking/calculate', {
                    car_id: car.id,
                    pickup_datetime: pickupDatetime,
                    return_datetime: returnDatetime,
                    pickup_location_id: parseInt(pickupLocationId),
                    driver_id: selectedDriverId || null,
                    promotion_code: promoApplied ? promoCode : null,
                });
                setPricing(response.data);
            } catch {
                // Silently fail - user can proceed
            } finally {
                setIsCalculating(false);
            }
        };

        calculatePricing();
    }, [pickupDatetime, returnDatetime, pickupLocationId, selectedDriverId, promoApplied, car.id, promoCode]);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;

        try {
            const response = await axios.post('/booking/validate-promotion', {
                code: promoCode,
                car_id: car.id,
                total_amount: pricing.total,
            });

            if (response.data.valid) {
                setPromoApplied(true);
                setPromoMessage(response.data.message);
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setPromoMessage(error.response?.data?.message || 'Invalid promotion code');
            setPromoApplied(false);
        }
    };

    const handleRemovePromo = () => {
        setPromoCode('');
        setPromoApplied(false);
        setPromoMessage('');
    };

    const handleSubmit = async () => {
        try {
            // Step 1: Create booking
            const bookingResponse = await axios.post('/booking/store', {
                car_id: car.id,
                pickup_datetime: pickupDatetime,
                return_datetime: returnDatetime,
                pickup_location_id: pickupLocationId,
                return_location_id: returnLocationId,
                driver_id: selectedDriverId || null,
                promotion_code: promoApplied ? promoCode : null,
                payment_method: paymentMethod,
                special_requests: specialRequests,
            });

            if (!bookingResponse.data.success) {
                alert('Failed to create booking: ' + bookingResponse.data.message);
                return;
            }

            const bookingId = bookingResponse.data.booking_id;

            // Step 2: Process payment based on method
            if (paymentMethod === 'paypal') {
                // Initiate PayPal payment
                const paymentResponse = await axios.post('/payment/process', {
                    booking_id: bookingId,
                    payment_method: 'paypal',
                    payment_type: 'full_payment', // or 'deposit'
                });

                if (paymentResponse.data.success && paymentResponse.data.approval_url) {
                    // Redirect to PayPal for payment
                    window.location.href = paymentResponse.data.approval_url;
                } else {
                    alert('Failed to initiate PayPal payment. Please try again.');
                }
            } else {
                // For other payment methods (credit_card, bank_transfer)
                // Redirect directly to confirmation page
                // In production, these would have their own payment flows
                router.visit(`/booking/${bookingId}/confirmation`);
            }
        } catch (error) {
            console.error('Booking error:', error);
            const err = error as { response?: { data?: { message?: string } } };
            alert('Error: ' + (err.response?.data?.message || 'Failed to process booking'));
        }
    };

    const goToStep = (step: Step) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <CustomerLayout
            title={`Book ${car.brand.name} ${car.name}`}
            description="Complete your booking"
        >
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Progress Indicator */}
                    <div className="mb-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between">
                            {[1, 2].map((step, index) => (
                                <div key={step} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <button
                                            onClick={() => goToStep(step as Step)}
                                            disabled={step > currentStep}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                                                step === currentStep
                                                    ? 'bg-blue-600 text-white'
                                                    : step < currentStep
                                                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                            }`}
                                        >
                                            {step}
                                        </button>
                                        <span
                                            className={`text-xs mt-2 hidden sm:block ${
                                                step <= currentStep
                                                    ? 'text-blue-600 font-medium'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {step === 1 ? 'Booking Details' : 'Review & Confirm'}
                                        </span>
                                    </div>
                                    {index < 1 && (
                                        <div
                                            className={`h-1 flex-1 mx-2 ${
                                                step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                        {/* Main Content */}
                        <div className="flex-1">
                            {/* STEP 1: Booking Details */}
                            {currentStep === 1 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Booking Details
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Dates & Times */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="pickupDatetime">
                                                        Pickup Date & Time
                                                    </Label>
                                                    <Input
                                                        id="pickupDatetime"
                                                        type="datetime-local"
                                                        value={pickupDatetime}
                                                        onChange={(e) =>
                                                            setPickupDatetime(e.target.value)
                                                        }
                                                        className="mt-1"
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="returnDatetime">
                                                        Return Date & Time
                                                    </Label>
                                                    <Input
                                                        id="returnDatetime"
                                                        type="datetime-local"
                                                        value={returnDatetime}
                                                        onChange={(e) =>
                                                            setReturnDatetime(e.target.value)
                                                        }
                                                        min={pickupDatetime}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>

                                            {/* Locations */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="pickupLocation">
                                                        Pickup Location
                                                    </Label>
                                                    <select
                                                        id="pickupLocation"
                                                        value={pickupLocationId}
                                                        onChange={(e) =>
                                                            setPickupLocationId(e.target.value)
                                                        }
                                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                                        aria-label="Select pickup location"
                                                    >
                                                        {locations.map((loc) => (
                                                            <option key={loc.id} value={loc.id}>
                                                                {loc.name}
                                                                {loc.is_airport ? ' (Airport)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <Label htmlFor="returnLocation">
                                                        Return Location
                                                    </Label>
                                                    <select
                                                        id="returnLocation"
                                                        value={returnLocationId}
                                                        onChange={(e) =>
                                                            setReturnLocationId(e.target.value)
                                                        }
                                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                                        aria-label="Select return location"
                                                    >
                                                        {locations.map((loc) => (
                                                            <option key={loc.id} value={loc.id}>
                                                                {loc.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Driver Service */}
                                            <div>
                                                <Label htmlFor="driver">
                                                    Driver Service (Optional)
                                                </Label>
                                                <select
                                                    id="driver"
                                                    value={selectedDriverId}
                                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                                                    aria-label="Select driver service"
                                                >
                                                    <option value="">No driver needed</option>
                                                    {drivers.map((driver) => (
                                                        <option key={driver.id} value={driver.id}>
                                                            {driver.name} - {formatCurrency(parseFloat(driver.daily_rate))}/day (Rating: {driver.rating}/5)
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Add a professional driver to your rental
                                                </p>
                                            </div>

                                            {/* Promo Code */}
                                            <div>
                                                <Label htmlFor="promo">Promo Code</Label>
                                                <div className="flex gap-2 mt-1">
                                                    <Input
                                                        id="promo"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value)}
                                                        placeholder="Enter promo code"
                                                        disabled={promoApplied}
                                                        className="flex-1"
                                                    />
                                                    {!promoApplied ? (
                                                        <Button
                                                            type="button"
                                                            onClick={handleApplyPromo}
                                                            variant="outline"
                                                            disabled={!promoCode.trim()}
                                                        >
                                                            Apply
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            onClick={handleRemovePromo}
                                                            variant="outline"
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                                {promoMessage && (
                                                    <p
                                                        className={`text-sm mt-1 ${
                                                            promoApplied
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                        }`}
                                                    >
                                                        {promoMessage}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Navigation */}
                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    onClick={() => goToStep(2)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Continue to Review
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 2: Review & Confirm */}
                            {currentStep === 2 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                            Review & Confirm
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Booking Details Summary */}
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-semibold text-gray-900">
                                                        Booking Details
                                                    </h3>
                                                    <Button
                                                        onClick={() => goToStep(1)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Pickup:</span>
                                                        <span className="font-medium">
                                                            {
                                                                locations.find(
                                                                    (loc) =>
                                                                        loc.id.toString() ===
                                                                        pickupLocationId
                                                                )?.name
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            Pickup Time:
                                                        </span>
                                                        <span className="font-medium">
                                                            {new Date(
                                                                pickupDatetime
                                                            ).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Return:</span>
                                                        <span className="font-medium">
                                                            {
                                                                locations.find(
                                                                    (loc) =>
                                                                        loc.id.toString() ===
                                                                        returnLocationId
                                                                )?.name
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">
                                                            Return Time:
                                                        </span>
                                                        <span className="font-medium">
                                                            {new Date(
                                                                returnDatetime
                                                            ).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                    {selectedDriverId && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">
                                                                Driver:
                                                            </span>
                                                            <span className="font-medium">
                                                                {
                                                                    drivers.find(
                                                                        (d) =>
                                                                            d.id.toString() ===
                                                                            selectedDriverId
                                                                    )?.name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer Info Summary (from auth user) */}
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-3">
                                                    Customer Information
                                                </h3>
                                                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Name:</span>
                                                        <span className="font-medium">
                                                            {auth.user.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Email:</span>
                                                        <span className="font-medium">
                                                            {auth.user.email}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Phone:</span>
                                                        <span className="font-medium">
                                                            {auth.user.phone || 'Not provided'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div>
                                                <Label className="block mb-3">Payment Method *</Label>
                                                <div className="space-y-3">
                                                    {[
                                                        {
                                                            value: 'credit_card',
                                                            label: 'Credit/Debit Card',
                                                            desc: 'Pay securely with Visa, Mastercard, or Amex',
                                                        },
                                                        {
                                                            value: 'paypal',
                                                            label: 'PayPal',
                                                            desc: 'Fast and secure payment via PayPal',
                                                        },
                                                        {
                                                            value: 'bank_transfer',
                                                            label: 'Bank Transfer',
                                                            desc: 'Direct transfer to our bank account',
                                                        },
                                                    ].map((method) => (
                                                        <label
                                                            key={method.value}
                                                            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                                                                paymentMethod === method.value
                                                                    ? 'border-blue-600 bg-blue-50'
                                                                    : 'border-gray-300 hover:border-gray-400'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="paymentMethod"
                                                                value={method.value}
                                                                checked={paymentMethod === method.value}
                                                                onChange={(e) =>
                                                                    setPaymentMethod(e.target.value)
                                                                }
                                                                className="mt-1 mr-3"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {method.label}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {method.desc}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Special Requests */}
                                            <div>
                                                <Label htmlFor="requests">
                                                    Special Requests (Optional)
                                                </Label>
                                                <Textarea
                                                    id="requests"
                                                    value={specialRequests}
                                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                                    placeholder="Any special requirements or requests?"
                                                    rows={4}
                                                    className="mt-1"
                                                />
                                            </div>

                                            {/* Terms & Conditions */}
                                            <div className="flex items-start space-x-3">
                                                <Checkbox
                                                    id="terms"
                                                    checked={acceptTerms}
                                                    onCheckedChange={(checked) =>
                                                        setAcceptTerms(checked as boolean)
                                                    }
                                                />
                                                <div className="flex-1">
                                                    <Label
                                                        htmlFor="terms"
                                                        className="font-medium cursor-pointer"
                                                    >
                                                        I agree to the Terms & Conditions *
                                                    </Label>
                                                    <p className="text-sm text-gray-500">
                                                        By confirming, you agree to our rental terms,
                                                        cancellation policy, and privacy policy.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Navigation */}
                                            <div className="flex justify-between pt-4">
                                                <Button
                                                    onClick={() => goToStep(1)}
                                                    variant="outline"
                                                >
                                                    Back to Details
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    disabled={!acceptTerms}
                                                >
                                                    Confirm Booking
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar - Booking Summary */}
                        <aside className="lg:w-96">
                            <Card className="sticky top-24">
                                <CardContent className="pt-6">
                                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

                                    {/* Car Info */}
                                    <div className="flex gap-3 mb-4 pb-4 border-b">
                                        <img
                                            src={car.primary_image}
                                            alt={car.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">
                                                {car.brand.name} {car.name}
                                            </h4>
                                            <p className="text-sm text-gray-600">{car.category.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {car.seats} seats · {car.transmission}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Base rental</span>
                                            <span className="font-semibold text-gray-900">
                                                {formatCurrency(pricing.base_price)}
                                            </span>
                                        </div>
                                        {(pricing.driver_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Driver service</span>
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(pricing.driver_fee ?? 0)}
                                                </span>
                                            </div>
                                        )}
                                        {(pricing.discount ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span>Discount</span>
                                                <span className="font-semibold">
                                                    -{formatCurrency(pricing.discount ?? 0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Total */}
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-lg font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                            {formatCurrency(pricing.total)}
                                        </span>
                                    </div>

                                    {isCalculating && (
                                        <p className="text-sm text-gray-500 mt-2 text-center">
                                            Recalculating...
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
