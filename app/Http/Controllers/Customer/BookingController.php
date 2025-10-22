<?php

namespace App\Http\Controllers\Customer;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Booking;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Display customer's booking list
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get filter parameters
        $status  = $request->input('status', 'all');
        $search  = $request->input('search', '');
        $perPage = $request->input('per_page', 10);

        // Build query
        $query = Booking::with([
            'car.brand',
            'car.category',
            'car.images',
            'pickupLocation',
            'returnLocation',
            'driver.user',
        ])
        ->where('user_id', $user->id)
        ->latest();

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply search filter (booking code or car name)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', "%{$search}%")
                  ->orWhereHas('car', function ($carQuery) use ($search) {
                      $carQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('model', 'like', "%{$search}%");
                  });
            });
        }

        // Paginate results
        $bookings = $query->paginate($perPage)->through(function ($booking) {
            return $this->transformBooking($booking);
        });

        // Calculate stats for dashboard
        $stats = [
            'total'     => Booking::where('user_id', Auth::id())->count(),
            'upcoming'  => Booking::where('user_id', Auth::id())
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('pickup_datetime', '>', now())
                ->count(),
            'active'    => Booking::where('user_id', Auth::id())
                ->where('status', 'active')
                ->count(),
            'completed' => Booking::where('user_id', Auth::id())
                ->where('status', 'completed')
                ->count(),
        ];

        return Inertia::render('customer/bookings/index', [
            'bookings' => $bookings,
            'stats'    => $stats,
            'filters'  => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Display single booking detail
     */
    public function show(Request $request, int $id): Response
    {
        $booking = Booking::with([
            'car.brand',
            'car.category',
            'car.images',
            'pickupLocation',
            'returnLocation',
            'driver.user',
            'charges',
            'promotions.promotion',
            'user',
        ])->findOrFail($id);

        // Authorization check - only booking owner can view
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this booking');
        }

        return Inertia::render('customer/bookings/show', [
            'booking' => $this->transformBookingDetail($booking),
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, int $id)
    {
        $booking = Booking::findOrFail($id);

        // Authorization check
        if ($booking->user_id !== Auth::id()) {
            abort(403, 'Unauthorized to cancel this booking');
        }

        // Validation - can only cancel pending or confirmed bookings
        if (!$booking->canBeCancelled()) {
            return back()->withErrors([
                'error' => 'This booking cannot be cancelled. Only pending or confirmed bookings can be cancelled.',
            ]);
        }

        // Validate cancellation reason
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        // Check cancellation policy (24 hours before pickup)
        $hoursUntilPickup = now()->diffInHours($booking->pickup_datetime, false);
        $canCancelFree = $hoursUntilPickup >= 24;

        // Update booking status
        $booking->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now(),
            'cancelled_by'        => Auth::id(),
            'cancellation_reason' => $request->reason,
        ]);

        // TODO: Process refund if payment was made
        // TODO: Send cancellation email notification
        // TODO: Notify car owner about cancellation

        return redirect()->route('customer.bookings.show', $booking->id)->with('success',
            $canCancelFree
                ? 'Booking cancelled successfully. Full refund will be processed within 5-7 business days.'
                : 'Booking cancelled. Cancellation fee may apply as per our policy.'
        );
    }

    /**
     * Transform booking for list view
     */
    private function transformBooking(Booking $booking): array
    {
        return [
            'id'              => $booking->id,
            'booking_code'    => $booking->booking_code,
            'status'          => $booking->status,
            'payment_status'  => $booking->payment_status,
            'pickup_datetime' => $booking->pickup_datetime->toISOString(),
            'return_datetime' => $booking->return_datetime->toISOString(),
            'total_amount'    => $booking->total_amount,
            'with_driver'     => $booking->with_driver,
            'is_delivery'     => $booking->is_delivery,
            'can_cancel'      => $booking->canBeCancelled(),
            'car'             => [
                'id'    => $booking->car->id,
                'name'  => $booking->car->name,
                'model' => $booking->car->model,
                'brand' => [
                    'id'   => $booking->car->brand->id,
                    'name' => $booking->car->brand->name,
                ],
                'category' => [
                    'id'   => $booking->car->category->id,
                    'name' => $booking->car->category->name,
                ],
                'primary_image' => $booking->car->images->firstWhere('is_primary', true)?->image_url
                    ?? $booking->car->images->first()?->image_url
                    ?? '/images/placeholder-car.jpg',
                'seats' => $booking->car->seats,
                'transmission' => $booking->car->transmission,
            ],
            'pickup_location' => [
                'id'      => $booking->pickupLocation->id,
                'name'    => $booking->pickupLocation->name,
                'address' => $booking->pickupLocation->address,
            ],
            'return_location' => [
                'id'      => $booking->returnLocation->id,
                'name'    => $booking->returnLocation->name,
                'address' => $booking->returnLocation->address,
            ],
        ];
    }

    /**
     * Transform booking for detail view
     */
    private function transformBookingDetail(Booking $booking): array
    {
        return [
            'id'                  => $booking->id,
            'booking_code'        => $booking->booking_code,
            'status'              => $booking->status,
            'payment_status'      => $booking->payment_status,
            'payment_method'      => $booking->payment_method,
            'pickup_datetime'     => $booking->pickup_datetime->toISOString(),
            'return_datetime'     => $booking->return_datetime->toISOString(),
            'actual_pickup_time'  => $booking->actual_pickup_time?->toISOString(),
            'actual_return_time'  => $booking->actual_return_time?->toISOString(),
            'total_amount'        => $booking->total_amount,
            'deposit_amount'      => $booking->deposit_amount,
            'with_driver'         => $booking->with_driver,
            'is_delivery'         => $booking->is_delivery,
            'delivery_address'    => $booking->delivery_address,
            'special_requests'    => $booking->special_requests,
            'cancellation_reason' => $booking->cancellation_reason,
            'confirmed_at'        => $booking->confirmed_at?->toISOString(),
            'cancelled_at'        => $booking->cancelled_at?->toISOString(),
            'can_cancel'          => $booking->canBeCancelled(),
            'created_at'          => $booking->created_at->toISOString(),
            'car'                 => [
                'id'    => $booking->car->id,
                'name'  => $booking->car->name,
                'model' => $booking->car->model,
                'brand' => [
                    'id'   => $booking->car->brand->id,
                    'name' => $booking->car->brand->name,
                ],
                'category' => [
                    'id'   => $booking->car->category->id,
                    'name' => $booking->car->category->name,
                ],
                'primary_image' => $booking->car->images->firstWhere('is_primary', true)?->image_url
                    ?? $booking->car->images->first()?->image_url
                    ?? '/images/placeholder-car.jpg',
                'seats'        => $booking->car->seats,
                'transmission' => $booking->car->transmission,
                'fuel_type'    => $booking->car->fuel_type,
            ],
            'pickup_location' => [
                'id'      => $booking->pickupLocation->id,
                'name'    => $booking->pickupLocation->name,
                'address' => $booking->pickupLocation->address,
            ],
            'return_location' => [
                'id'      => $booking->returnLocation->id,
                'name'    => $booking->returnLocation->name,
                'address' => $booking->returnLocation->address,
            ],
            'driver'     => $booking->driver ? [
                'id'             => $booking->driver->id,
                'name'           => $booking->driver->user->name,
                'phone'          => $booking->driver->user->phone ?? 'N/A',
                'average_rating' => $booking->driver->average_rating ?? 0,
            ] : null,
            'customer'   => [
                'name'  => $booking->user->name,
                'email' => $booking->user->email,
                'phone' => $booking->user->phone ?? 'N/A',
            ],
            'charges'    => $booking->charges->map(fn($charge) => [
                'id'          => $charge->id,
                'type'        => $charge->type,
                'description' => $charge->description,
                'amount'      => $charge->amount,
            ])->toArray(),
            'promotions' => $booking->promotions->map(fn($promo) => [
                'id'              => $promo->id,
                'code'            => $promo->promotion_code,
                'discount_amount' => $promo->discount_amount,
            ])->toArray(),
        ];
    }
}
