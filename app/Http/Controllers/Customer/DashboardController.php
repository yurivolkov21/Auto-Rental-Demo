<?php

namespace App\Http\Controllers\Customer;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Booking;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Display customer dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get upcoming bookings (next 30 days)
        $upcomingBookings = Booking::with([
            'car.brand',
            'car.category',
            'car.images',
            'pickupLocation',
            'returnLocation',
        ])
        ->where('user_id', $user->id)
        ->whereIn('status', ['pending', 'confirmed'])
        ->where('pickup_datetime', '>', now())
        ->where('pickup_datetime', '<=', now()->addDays(30))
        ->orderBy('pickup_datetime', 'asc')
        ->limit(5)
        ->get()
        ->map(function ($booking) {
            return [
                'id'              => $booking->id,
                'booking_code'    => $booking->booking_code,
                'status'          => $booking->status,
                'pickup_datetime' => $booking->pickup_datetime->toISOString(),
                'return_datetime' => $booking->return_datetime->toISOString(),
                'total_amount'    => $booking->total_amount,
                'car'             => [
                    'id'            => $booking->car->id,
                    'name'          => $booking->car->name,
                    'brand'         => $booking->car->brand->name,
                    'category'      => $booking->car->category->name,
                    'primary_image' => $booking->car->images->firstWhere('is_primary', true)?->image_url
                        ?? $booking->car->images->first()?->image_url
                        ?? '/images/placeholder-car.jpg',
                ],
                'pickup_location' => [
                    'name' => $booking->pickupLocation->name,
                ],
            ];
        });

        // Get active bookings (currently renting)
        $activeBookings = Booking::with([
            'car.brand',
            'car.category',
            'car.images',
            'pickupLocation',
            'returnLocation',
        ])
        ->where('user_id', $user->id)
        ->where('status', 'active')
        ->orderBy('return_datetime', 'asc')
        ->get()
        ->map(function ($booking) {
            return [
                'id'              => $booking->id,
                'booking_code'    => $booking->booking_code,
                'status'          => $booking->status,
                'pickup_datetime' => $booking->pickup_datetime->toISOString(),
                'return_datetime' => $booking->return_datetime->toISOString(),
                'total_amount'    => $booking->total_amount,
                'car'             => [
                    'id'            => $booking->car->id,
                    'name'          => $booking->car->name,
                    'brand'         => $booking->car->brand->name,
                    'category'      => $booking->car->category->name,
                    'primary_image' => $booking->car->images->firstWhere('is_primary', true)?->image_url
                        ?? $booking->car->images->first()?->image_url
                        ?? '/images/placeholder-car.jpg',
                ],
                'return_location' => [
                    'name' => $booking->returnLocation->name,
                ],
            ];
        });

        // Calculate statistics
        $stats = [
            'total_bookings' => Booking::where('user_id', $user->id)->count(),
            'upcoming_bookings' => Booking::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('pickup_datetime', '>', now())
                ->count(),
            'active_bookings' => Booking::where('user_id', $user->id)
                ->where('status', 'active')
                ->count(),
            'completed_bookings' => Booking::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'total_spent' => Booking::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('total_amount'),
            'pending_reviews' => Booking::where('user_id', $user->id)
                ->where('status', 'completed')
                ->whereDoesntHave('review')
                ->count(),
        ];

        return Inertia::render('customer/dashboard', [
            'upcomingBookings' => $upcomingBookings,
            'activeBookings' => $activeBookings,
            'stats' => $stats,
        ]);
    }
}
