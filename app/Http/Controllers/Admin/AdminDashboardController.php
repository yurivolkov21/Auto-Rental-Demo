<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Car;
use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard with statistics
     */
    public function index(): Response
    {
        // Users Statistics
        $totalUsers = User::count();
        $activeUsers = User::where('status', 'active')->count();
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();

        // Cars Statistics
        $totalCars = Car::count();
        $availableCars = Car::where('status', 'available')->count();
        $rentedCars = Car::where('status', 'rented')->count();

        // Bookings Statistics
        $totalBookings = Booking::count();
        $pendingBookings = Booking::where('status', 'pending')->count();
        $confirmedBookings = Booking::where('status', 'confirmed')->count();
        $completedBookings = Booking::where('status', 'completed')->count();

        // Revenue Statistics
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $todayRevenue = Payment::where('status', 'completed')
            ->whereDate('created_at', today())
            ->sum('amount');
        $monthRevenue = Payment::where('status', 'completed')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('amount');

        // Reviews Statistics
        $totalReviews = Review::count();
        $pendingReviews = Review::where('status', 'pending')->count();
        $approvedReviews = Review::where('status', 'approved')->count();
        $averageRating = Review::where('status', 'approved')->avg('rating') ?? 0;

        // Chart Data: Monthly Bookings (Last 6 months)
        $monthlyBookings = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = Booking::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $monthlyBookings[] = [
                'month' => $date->format('M Y'),
                'bookings' => $count,
            ];
        }

        // Chart Data: Revenue by Month (Last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = Payment::where('status', 'completed')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('amount');
            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        // Chart Data: Booking Status Distribution
        $bookingsByStatus = [
            ['status' => 'Pending', 'count' => $pendingBookings, 'fill' => '#fbbf24'],
            ['status' => 'Confirmed', 'count' => $confirmedBookings, 'fill' => '#3b82f6'],
            ['status' => 'Completed', 'count' => $completedBookings, 'fill' => '#22c55e'],
            ['status' => 'Cancelled', 'count' => Booking::where('status', 'cancelled')->count(), 'fill' => '#ef4444'],
        ];

        // Chart Data: Reviews Rating Distribution
        $reviewsByRating = [];
        for ($rating = 5; $rating >= 1; $rating--) {
            $count = Review::where('rating', $rating)->count();
            $reviewsByRating[] = [
                'rating' => $rating . ' ⭐',
                'count' => $count,
                'fill' => $rating >= 4 ? '#22c55e' : ($rating >= 3 ? '#fbbf24' : '#ef4444'),
            ];
        }

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'verified' => $verifiedUsers,
                ],
                'cars' => [
                    'total' => $totalCars,
                    'available' => $availableCars,
                    'rented' => $rentedCars,
                ],
                'bookings' => [
                    'total' => $totalBookings,
                    'pending' => $pendingBookings,
                    'confirmed' => $confirmedBookings,
                    'completed' => $completedBookings,
                ],
                'revenue' => [
                    'total' => $totalRevenue,
                    'today' => $todayRevenue,
                    'month' => $monthRevenue,
                ],
                'reviews' => [
                    'total' => $totalReviews,
                    'pending' => $pendingReviews,
                    'approved' => $approvedReviews,
                    'average_rating' => round($averageRating, 2),
                ],
            ],
            'charts' => [
                'monthlyBookings' => $monthlyBookings,
                'monthlyRevenue' => $monthlyRevenue,
                'bookingsByStatus' => $bookingsByStatus,
                'reviewsByRating' => $reviewsByRating,
            ],
        ]);
    }
}
