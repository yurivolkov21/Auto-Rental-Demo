<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Car;
use App\Models\Location;
use App\Models\DriverProfile;
use App\Models\Promotion;
use App\Services\BookingPricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private BookingPricingService $pricingService
    ) {}

    /**
     * Show booking checkout page
     */
    public function checkout(Request $request): Response
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'pickup_date' => 'required|date|after_or_equal:today',
            'return_date' => 'required|date|after:pickup_date',
            'pickup_location_id' => 'nullable|exists:locations,id',
        ]);

        // Get car with relationships
        $car = Car::with(['category', 'brand', 'location', 'images'])
            ->where('id', $request->car_id)
            ->where('status', 'available')
            ->firstOrFail();

        // Get all locations
        $locations = Location::where('is_active', true)
            ->orderBy('is_popular', 'desc')
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'is_airport', 'is_popular']);

        // Get available drivers
        $drivers = DriverProfile::where('is_available_for_booking', true)
            ->where('status', 'available')
            ->with('user:id,name')
            ->get()
            ->map(fn($driver) => [
                'id' => $driver->id,
                'name' => $driver->user->name,
                'daily_rate' => $driver->daily_fee, // Map daily_fee to daily_rate for frontend
                'languages' => [], // Default empty array (field doesn't exist in current migration)
                'rating' => $driver->average_rating ?? 0,
            ]);

        // Calculate initial pricing
        $pricing = $this->pricingService->calculateTotalBreakdown([
            'car_id' => $car->id,
            'pickup_datetime' => $request->pickup_date . ' 09:00:00',
            'return_datetime' => $request->return_date . ' 18:00:00',
        ]);

        // Transform car data
        $carData = [
            'id' => $car->id,
            'name' => $car->name,
            'model' => $car->model,
            'brand' => ['id' => $car->brand->id, 'name' => $car->brand->name],
            'category' => ['id' => $car->category->id, 'name' => $car->category->name],
            'daily_rate' => $car->daily_rate,
            'primary_image' => $car->images->firstWhere('is_primary', true)?->url ?? $car->images->first()?->url ?? '/images/placeholder-car.jpg',
            'seats' => $car->seats,
            'transmission' => $car->transmission,
            'fuel_type' => $car->fuel_type,
        ];

        return Inertia::render('customer/booking/checkout', [
            'car' => $carData,
            'locations' => $locations,
            'drivers' => $drivers,
            'initialPricing' => $pricing,
            'bookingDetails' => [
                'car_id' => $request->car_id,
                'pickup_date' => $request->pickup_date,
                'return_date' => $request->return_date,
                'pickup_location_id' => $request->pickup_location_id ?? $car->location_id,
                'return_location_id' => $request->pickup_location_id ?? $car->location_id,
            ],
        ]);
    }

    /**
     * Calculate booking price (AJAX)
     */
    public function calculate(Request $request)
    {
        $request->validate([
            'car_id' => 'required|exists:cars,id',
            'pickup_datetime' => 'required|date',
            'return_datetime' => 'required|date|after:pickup_datetime',
            'driver_id' => 'nullable|exists:driver_profiles,id',
            'promotion_code' => 'nullable|string',
        ]);

        $pricing = $this->pricingService->calculateTotalBreakdown($request->all());

        return response()->json($pricing);
    }

    /**
     * Validate and apply promotion code (AJAX)
     */
    public function validatePromotion(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'car_id' => 'required|exists:cars,id',
            'total_amount' => 'required|numeric|min:0',
        ]);

        $promotion = Promotion::where('code', $request->code)
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        if (!$promotion) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired promotion code',
            ], 422);
        }

        // Check usage limit
        if ($promotion->usage_limit && $promotion->usage_count >= $promotion->usage_limit) {
            return response()->json([
                'valid' => false,
                'message' => 'This promotion has reached its usage limit',
            ], 422);
        }

        // Check minimum amount
        if ($promotion->min_rental_amount && $request->total_amount < $promotion->min_rental_amount) {
            return response()->json([
                'valid' => false,
                'message' => "Minimum rental amount is {$promotion->min_rental_amount} for this promotion",
            ], 422);
        }

        // Calculate discount
        $discount = 0;
        if ($promotion->discount_type === 'percentage') {
            $discount = ($request->total_amount * $promotion->discount_value) / 100;
            if ($promotion->max_discount_amount) {
                $discount = min($discount, $promotion->max_discount_amount);
            }
        } else {
            $discount = $promotion->discount_value;
        }

        return response()->json([
            'valid' => true,
            'promotion' => [
                'id' => $promotion->id,
                'code' => $promotion->code,
                'name' => $promotion->name,
                'discount_type' => $promotion->discount_type,
                'discount_value' => $promotion->discount_value,
                'discount_amount' => $discount,
            ],
            'message' => 'Promotion applied successfully',
        ]);
    }

    /**
     * Store new booking
     * Requires authentication
     */
    public function store(Request $request)
    {
        // Require authentication
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to complete your booking');
        }

        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'pickup_datetime' => 'required|date|after_or_equal:now',
            'return_datetime' => 'required|date|after:pickup_datetime',
            'pickup_location_id' => 'required|exists:locations,id',
            'return_location_id' => 'required|exists:locations,id',
            'driver_id' => 'nullable|exists:driver_profiles,id',
            'promotion_code' => 'nullable|string',
            'payment_method' => 'required|in:credit_card,paypal,bank_transfer',
            'special_requests' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            // Check car availability
            $car = Car::findOrFail($validated['car_id']);

            $conflictingBookings = Booking::where('car_id', $car->id)
                ->where('status', '!=', 'cancelled')
                ->where(function ($query) use ($validated) {
                    $query->whereBetween('pickup_datetime', [$validated['pickup_datetime'], $validated['return_datetime']])
                        ->orWhereBetween('return_datetime', [$validated['pickup_datetime'], $validated['return_datetime']])
                        ->orWhere(function ($q) use ($validated) {
                            $q->where('pickup_datetime', '<=', $validated['pickup_datetime'])
                              ->where('return_datetime', '>=', $validated['return_datetime']);
                        });
                })
                ->exists();

            if ($conflictingBookings) {
                throw new \Exception('Car is not available for the selected dates');
            }

            // Calculate final pricing
            $pricing = $this->pricingService->calculateTotalBreakdown([
                'car_id' => $validated['car_id'],
                'pickup_datetime' => $validated['pickup_datetime'],
                'return_datetime' => $validated['return_datetime'],
                'driver_id' => $validated['driver_id'] ?? null,
                'promotion_code' => $validated['promotion_code'] ?? null,
            ]);

            // Get car owner_id
            $carOwner = $car->owner_id;

            // Generate unique booking code
            $bookingCode = 'BK-' . date('Y') . '-' . str_pad(Booking::count() + 1, 6, '0', STR_PAD_LEFT);

            // Create booking
            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'user_id' => Auth::id(),
                'owner_id' => $carOwner,
                'car_id' => $validated['car_id'],
                'pickup_location_id' => $validated['pickup_location_id'],
                'return_location_id' => $validated['return_location_id'],
                'pickup_datetime' => $validated['pickup_datetime'],
                'return_datetime' => $validated['return_datetime'],
                'status' => 'pending',
                'total_amount' => $pricing['total'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'special_requests' => $validated['special_requests'] ?? null,
                // Snapshot pricing fields
                'hourly_rate' => $car->hourly_rate,
                'daily_rate' => $car->daily_rate,
                'deposit_amount' => $car->deposit_amount ?? 0,
            ]);

            // Add driver if selected
            if (!empty($validated['driver_id'])) {
                $driver = DriverProfile::findOrFail($validated['driver_id']);
                $booking->update([
                    'with_driver' => true,
                    'driver_profile_id' => $validated['driver_id'],
                    'driver_hourly_fee' => $driver->hourly_rate,
                    'driver_daily_fee' => $driver->daily_rate,
                ]);
            }

            // Add promotion if valid
            if (!empty($validated['promotion_code']) && !empty($pricing['promotion'])) {
                $promotion = Promotion::where('code', $validated['promotion_code'])->first();
                if ($promotion) {
                    $booking->promotions()->attach($promotion->id, [
                        'discount_amount' => $pricing['discount'],
                    ]);
                    $promotion->increment('usage_count');
                }
            }

            // Store charges breakdown
            $charges = [
                ['type' => 'base_rental', 'amount' => $pricing['base_price'], 'description' => 'Base rental fee'],
            ];

            if (!empty($pricing['driver_fee'])) {
                $charges[] = ['type' => 'driver_service', 'amount' => $pricing['driver_fee'], 'description' => 'Driver service'];
            }

            if (!empty($pricing['discount'])) {
                $charges[] = ['type' => 'discount', 'amount' => -$pricing['discount'], 'description' => 'Promotion discount'];
            }

            foreach ($charges as $charge) {
                $booking->charges()->create($charge);
            }

            DB::commit();

            // Redirect to confirmation page
            return redirect()->route('booking.confirmation', $booking->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show booking confirmation page
     */
    public function confirmation(Request $request, int $id): Response
    {
        $booking = Booking::with([
            'car.brand',
            'car.category',
            'car.images',
            'pickupLocation',
            'returnLocation',
            'driver.user',
            'charges',
            'promotions',
        ])->findOrFail($id);

        // Authorization check - only booking owner can view
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to booking');
        }

                $bookingData = [
            'id' => $booking->id,
            'booking_reference' => $booking->booking_code, // Use booking_code field
            'status' => $booking->status,
            'pickup_datetime' => $booking->pickup_datetime,
            'return_datetime' => $booking->return_datetime,
            'total_amount' => $booking->total_amount,
            'payment_method' => $booking->payment_method,
            'payment_status' => $booking->payment_status,
            'with_insurance' => false, // Not implemented yet
            'special_requests' => $booking->special_requests,
            'car' => [
                'id' => $booking->car->id,
                'name' => $booking->car->name,
                'model' => $booking->car->model,
                'brand' => [
                    'id' => $booking->car->brand->id,
                    'name' => $booking->car->brand->name,
                ],
                'category' => [
                    'id' => $booking->car->category->id,
                    'name' => $booking->car->category->name,
                ],
                'primary_image' => $booking->car->images->firstWhere('is_primary', true)?->url ?? $booking->car->images->first()?->url ?? '/images/placeholder-car.jpg',
                'seats' => $booking->car->seats,
                'transmission' => $booking->car->transmission,
                'fuel_type' => $booking->car->fuel_type,
            ],
            'pickup_location' => [
                'id' => $booking->pickupLocation->id,
                'name' => $booking->pickupLocation->name,
                'address' => $booking->pickupLocation->address,
            ],
            'return_location' => [
                'id' => $booking->returnLocation->id,
                'name' => $booking->returnLocation->name,
                'address' => $booking->returnLocation->address,
            ],
            'driver' => $booking->driver ? [
                'id' => $booking->driver->id,
                'name' => $booking->driver->user->name,
                'phone' => $booking->driver->user->phone ?? 'N/A',
            ] : null,
            'customer' => [
                'name' => $booking->user->name,
                'email' => $booking->user->email,
                'phone' => $booking->user->phone ?? 'N/A',
            ],
            'charges' => $booking->charges->map(fn($charge) => [
                'type' => $charge->type,
                'description' => $charge->description,
                'amount' => $charge->amount,
            ])->toArray(),
        ];

        return Inertia::render('customer/booking/confirmation', [
            'booking' => $bookingData,
        ]);
    }
}
