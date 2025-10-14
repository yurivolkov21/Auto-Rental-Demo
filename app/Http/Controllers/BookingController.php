<?php

namespace App\Http\Controllers;

use App\Models\Car;
use Inertia\Inertia;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\BookingPricingService;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\CancelBookingRequest;

class BookingController extends Controller
{
    public function __construct(
        protected BookingPricingService $pricingService
    ) {
    }

    /**
     * Display a listing of the user's bookings.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Booking::with([
            'car.brand',
            'car.category',
            'car.location',
            'car.owner',
            'charge',
            'pickupLocation',
            'dropoffLocation',
            'driver',
        ])
            ->where('user_id', $user->id)
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by booking code or car
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                    ->orWhereHas('car', function ($carQuery) use ($search) {
                        $carQuery->where('model', 'like', "%{$search}%")
                            ->orWhere('license_plate', 'like', "%{$search}%");
                    });
            });
        }

        $bookings = $query->paginate(10);

        return Inertia::render('bookings/index', [
            'bookings' => $bookings,
            'filters'  => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Display the specified booking.
     */
    public function show(Booking $booking)
    {
        $user = Auth::user();

        // Authorization: Only booking owner can view
        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized to view this booking.');
        }

        $booking->load([
            'car.brand',
            'car.category',
            'car.location',
            'car.owner',
            'car.images',
            'charge',
            'pickupLocation',
            'dropoffLocation',
            'driver',
            'promotions',
            'confirmedBy',
            'cancelledBy',
        ]);

        return Inertia::render('bookings/show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Show the form for creating a new booking.
     */
    public function create(Request $request)
    {
        $carId = $request->query('car_id');

        if (!$carId) {
            return redirect()->route('home')->with('error', 'Please select a car to book.');
        }

        $car = Car::with(['brand', 'category', 'location', 'owner', 'images'])
            ->where('status', 'available')
            ->findOrFail($carId);

        return Inertia::render('bookings/create', [
            'car' => $car,
        ]);
    }

    /**
     * Store a newly created booking.
     */
    public function store(StoreBookingRequest $request)
    {
        $validated = $request->validated();

        $user = Auth::user();
        $car  = Car::findOrFail($validated['car_id']);

        // TODO: Check car availability (no conflicts with existing bookings)

        // Calculate pricing
        $pricingData = array_merge($validated, [
            'user_id' => $user->id,
        ]);

        $pricing = $this->pricingService->calculateTotalBreakdown($pricingData);

        // Create booking
        $booking = Booking::create([
            'booking_code' => $this->generateBookingCode(),
            'user_id'      => $user->id,
            'car_id'       => $car->id,
            'owner_id'     => $car->owner_id,
            'status'       => 'pending',

            // Dates
            'pickup_datetime' => $validated['pickup_datetime'],
            'return_datetime' => $validated['return_datetime'],

            // Locations
            'pickup_location_id'  => $validated['pickup_location_id'],
            'dropoff_location_id' => $validated['dropoff_location_id'] ?? $validated['pickup_location_id'],

            // Driver service
            'with_driver'       => $validated['with_driver'] ?? false,
            'driver_profile_id' => $validated['driver_profile_id'] ?? null,

            // Delivery service
            'is_delivery'       => $validated['is_delivery'] ?? false,
            'delivery_address'  => $validated['delivery_address'] ?? null,
            'delivery_distance' => $pricing['delivery']['delivery_distance'] ?? null,

            // Pricing snapshots
            'hourly_rate'         => $pricing['rental']['hourly_rate'],
            'daily_rate'          => $pricing['rental']['daily_rate'],
            'driver_hourly_fee'   => $pricing['driver']['driver_hourly_fee'] ?? null,
            'driver_daily_fee'    => $pricing['driver']['driver_daily_fee'] ?? null,
            'delivery_fee_per_km' => $pricing['delivery']['delivery_fee_per_km'] ?? null,

            // Notes
            'notes' => $validated['notes'] ?? null,
        ]);

        // Create booking charge
        $booking->charge()->create([
            'total_hours' => $pricing['rental']['total_hours'],
            'total_days'        => $pricing['rental']['total_days'],
            'hourly_rate'       => $pricing['rental']['hourly_rate'],
            'daily_rate'        => $pricing['rental']['daily_rate'],
            'base_amount'       => $pricing['rental']['base_amount'],
            'delivery_fee'      => $pricing['delivery']['delivery_fee'],
            'driver_fee_amount' => $pricing['driver']['driver_fee_amount'],
            'extra_fee'         => $pricing['extra_fee'],
            'discount_amount'   => $pricing['discount']['discount_amount'],
            'subtotal'          => $pricing['subtotal'],
            'vat_amount'        => $pricing['vat_amount'],
            'total_amount'      => $pricing['total_amount'],
            'deposit_amount'    => $pricing['deposit_amount'],
            'amount_paid'       => 0,
            'balance_due'       => $pricing['total_amount'],
        ]);

        // Apply promotion if valid
        if ($pricing['discount']['is_valid'] && $pricing['discount']['promotion_id']) {
            $booking->promotions()->create([
                'promotion_id'      => $pricing['discount']['promotion_id'],
                'discount_amount'   => $pricing['discount']['discount_amount'],
                'promotion_details' => $pricing['discount']['promotion_details'],
            ]);
        }

        // TODO: Send confirmation email

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking created successfully! Booking code: ' . $booking->booking_code);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Booking $booking, CancelBookingRequest $request)
    {
        $user = Auth::user();

        // Authorization: Only booking owner can cancel
        if ($booking->user_id !== $user->id) {
            abort(403, 'Unauthorized to cancel this booking.');
        }

        // Validation: Can only cancel pending or confirmed bookings
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'Cannot cancel booking with status: ' . $booking->status);
        }

        $validated = $request->validated();

        $booking->update([
            'status'              => 'cancelled',
            'cancelled_by'        => $user->id,
            'cancelled_at'        => now(),
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        // TODO: Calculate refund amount
        // TODO: Send cancellation email

        return redirect()->route('bookings.show', $booking)
            ->with('success', 'Booking cancelled successfully.');
    }

    /**
     * Calculate pricing preview (AJAX endpoint).
     */
    public function calculatePrice(Request $request)
    {
        $validated = $request->validate([
            'car_id'              => 'required|exists:cars,id',
            'pickup_datetime'     => 'required|date',
            'return_datetime'     => 'required|date|after:pickup_datetime',
            'pickup_location_id'  => 'required|exists:locations,id',
            'dropoff_location_id' => 'nullable|exists:locations,id',
            'with_driver'         => 'boolean',
            'driver_profile_id'   => 'nullable|exists:driver_profiles,id',
            'is_delivery'         => 'boolean',
            'delivery_address'    => 'nullable|string',
            'promotion_code'      => 'nullable|string',
        ]);

        $user = Auth::user();

        $pricingData = array_merge($validated, [
            'user_id' => $user->id,
        ]);

        $pricing = $this->pricingService->calculateTotalBreakdown($pricingData);

        return response()->json($pricing);
    }

    /**
     * Generate unique booking code.
     */
    private function generateBookingCode(): string
    {
        do {
            $code = 'BK' . strtoupper(substr(uniqid(), -8));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }
}
