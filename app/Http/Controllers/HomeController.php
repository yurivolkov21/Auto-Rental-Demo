<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarCategory;
use App\Models\Location;
use App\Models\Promotion;
use App\Models\Booking;
use App\Models\Review;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the home page
     */
    public function index(): Response
    {
        // Get featured cars (latest available cars, max 8)
        $featuredCars = Car::with(['category', 'brand', 'location', 'images'])
            ->where('status', 'available')
            ->where('is_verified', true)
            ->latest()
            ->limit(8)
            ->get();

        // Get popular categories with car counts
        $categories = CarCategory::withCount(['cars' => function ($query) {
            $query->where('status', 'available');
        }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        // Get active promotions (max 3)
        $activePromotions = Promotion::where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('is_featured', 'desc')
            ->limit(3)
            ->get();

        // Get all locations for search
        $locations = Location::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'address', 'is_airport', 'is_popular']);

        // Get statistics
        $stats = [
            'total_cars' => Car::where('status', 'available')->count(),
            'total_locations' => Location::where('is_active', true)->count(),
            'happy_customers' => Booking::where('status', 'completed')->distinct('user_id')->count('user_id'),
            'total_bookings' => Booking::where('status', 'completed')->count(),
        ];

        // Get recent reviews (max 6)
        $recentReviews = Review::with(['user', 'car' => function ($query) {
            $query->select('id', 'model', 'brand_id')->with('brand:id,name');
        }])
            ->where('status', 'approved')
            ->where('rating', '>=', 4) // Only show 4-5 star reviews on homepage
            ->latest()
            ->limit(6)
            ->get();

        return Inertia::render('customer/home', [
            'featuredCars' => $featuredCars,
            'categories' => $categories,
            'activePromotions' => $activePromotions,
            'locations' => $locations,
            'stats' => $stats,
            'recentReviews' => $recentReviews,
        ]);
    }
}
