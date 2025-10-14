<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Car;
use App\Models\User;
use App\Models\Location;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display a listing of all bookings (admin view).
     */
    public function index(Request $request)
    {
        $query = Booking::with([
            'user',
            'car.brand',
            'car.category',
            'car.owner',
            'charge',
            'pickupLocation',
            'returnLocation',
            'driverProfile',
        ])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by owner
        if ($request->has('owner_id') && $request->owner_id) {
            $query->where('owner_id', $request->owner_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('pickup_datetime', '>=', $request->start_date);
        }
        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('pickup_datetime', '<=', $request->end_date);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('car', function ($carQuery) use ($search) {
                        $carQuery->where('model', 'like', "%{$search}%")
                            ->orWhere('license_plate', 'like', "%{$search}%");
                    });
            });
        }

        $bookings = $query->paginate(15);

        // Statistics for dashboard
        $stats = [
            'total'     => Booking::count(),
            'pending'   => Booking::where('status', 'pending')->count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'active'    => Booking::where('status', 'active')->count(),
            'completed' => Booking::where('status', 'completed')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
            'rejected'  => Booking::where('status', 'rejected')->count(),
        ];

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'stats'    => $stats,
            'filters'        => [
                'status'     => $request->status ?? 'all',
                'owner_id'   => $request->owner_id ?? null,
                'start_date' => $request->start_date ?? null,
                'end_date'   => $request->end_date ?? null,
                'search'     => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Display the specified booking (admin view).
     */
    public function show(Booking $booking)
    {
        $booking->load([
            'user',
            'car.brand',
            'car.category',
            'car.location',
            'car.owner',
            'car.images',
            'charge',
            'pickupLocation',
            'returnLocation',
            'driverProfile',
            'promotions.promotion',
            'confirmedBy',
            'cancelledBy',
        ]);

        return Inertia::render('admin/bookings/show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Show the form for editing the specified booking.
     */
    public function edit(Booking $booking)
    {
        $booking->load([
            'user',
            'car.brand',
            'charge',
            'pickupLocation',
            'returnLocation',
            'driverProfile',
        ]);

        $cars = Car::with(['brand', 'category', 'owner'])
            ->where('status', 'available')
            ->get();

        $locations = Location::where('is_active', true)->get();

        $drivers = DriverProfile::where('status', 'available')->get();

        return Inertia::render('admin/bookings/edit', [
            'booking'   => $booking,
            'cars'      => $cars,
            'locations' => $locations,
            'drivers'   => $drivers,
        ]);
    }

    /**
     * Update the specified booking.
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'pickup_datetime'     => 'required|date',
            'return_datetime'     => 'required|date|after:pickup_datetime',
            'pickup_location_id'  => 'required|exists:locations,id',
            'dropoff_location_id' => 'nullable|exists:locations,id',
            'with_driver'         => 'boolean',
            'driver_profile_id'   => 'nullable|exists:driver_profiles,id',
            'is_delivery'         => 'boolean',
            'delivery_address'    => 'nullable|string|max:500',
            'notes'               => 'nullable|string|max:1000',
            'admin_notes'         => 'nullable|string|max:1000',
        ]);

        $booking->update($validated);

        return redirect()->route('admin.bookings.show', $booking)
            ->with('success', 'Booking updated successfully.');
    }

    /**
     * Confirm a pending booking.
     */
    public function confirm(Booking $booking)
    {
        if ($booking->status !== 'pending') {
            return back()->with('error', 'Only pending bookings can be confirmed.');
        }

        $booking->update([
            'status'       => 'confirmed',
            'confirmed_by' => Auth::id(),
            'confirmed_at' => now(),
        ]);

        // TODO: Send confirmation email to customer

        return back()->with('success', 'Booking confirmed successfully.');
    }

    /**
     * Reject a pending booking.
     */
    public function reject(Request $request, Booking $booking)
    {
        if ($booking->status !== 'pending') {
            return back()->with('error', 'Only pending bookings can be rejected.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $booking->update([
            'status'       => 'rejected',
            'cancelled_by' => Auth::id(),
            'cancelled_at' => now(),
            'cancellation_reason' => $validated['rejection_reason'],
        ]);

        // TODO: Send rejection email to customer

        return back()->with('success', 'Booking rejected.');
    }

    /**
     * Mark booking as active (car picked up).
     */
    public function activate(Booking $booking)
    {
        if ($booking->status !== 'confirmed') {
            return back()->with('error', 'Only confirmed bookings can be activated.');
        }

        $booking->update([
            'status'                 => 'active',
            'actual_pickup_datetime' => now(),
        ]);

        return back()->with('success', 'Booking activated. Car has been picked up.');
    }

    /**
     * Complete a booking (car returned).
     */
    public function complete(Request $request, Booking $booking)
    {
        if ($booking->status !== 'active') {
            return back()->with('error', 'Only active bookings can be completed.');
        }

        $validated = $request->validate([
            'actual_return_datetime' => 'required|date',
            'car_condition_notes'    => 'nullable|string|max:1000',
            'extra_fee'              => 'nullable|numeric|min:0',
            'extra_fee_reason'       => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->update([
                'status'                 => 'completed',
                'actual_return_datetime' => $validated['actual_return_datetime'],
                'car_condition_notes'    => $validated['car_condition_notes'] ?? null,
            ]);

            // Update extra fees if provided
            if (isset($validated['extra_fee']) && $validated['extra_fee'] > 0) {
                $charge         = $booking->charge;
                $newExtraFee    = $charge->extra_fee + $validated['extra_fee'];
                $newSubtotal    = $charge->subtotal + $validated['extra_fee'];
                $newVatAmount   = $newSubtotal * 0.10;
                $newTotalAmount = $newSubtotal + $newVatAmount;
                $newBalanceDue  = $newTotalAmount - $charge->amount_paid - $charge->deposit_amount;

                $extraFeeDetails = $charge->extra_fee_details ?? [];
                $extraFeeDetails['admin_charge'] = [
                    'amount'   => $validated['extra_fee'],
                    'reason'   => $validated['extra_fee_reason'] ?? 'Additional charge',
                    'added_at' => now()->toDateTimeString(),
                ];

                $charge->update([
                    'extra_fee'         => $newExtraFee,
                    'extra_fee_details' => $extraFeeDetails,
                    'subtotal'          => $newSubtotal,
                    'vat_amount'        => $newVatAmount,
                    'total_amount'      => $newTotalAmount,
                    'balance_due'       => $newBalanceDue,
                ]);
            }
        });

        // TODO: Send completion email with final invoice

        return back()->with('success', 'Booking completed successfully.');
    }

    /**
     * Remove the specified booking.
     */
    public function destroy(Booking $booking)
    {
        // Only allow deleting cancelled or rejected bookings
        if (!in_array($booking->status, ['cancelled', 'rejected'])) {
            return back()->with('error', 'Only cancelled or rejected bookings can be deleted.');
        }

        $booking->delete();

        return redirect()->route('admin.bookings.index')
            ->with('success', 'Booking deleted successfully.');
    }
}
