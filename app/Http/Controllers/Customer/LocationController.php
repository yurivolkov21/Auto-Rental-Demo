<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\Car;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function index(): Response
    {
        $locations = Location::where('is_active', true)
            ->orderBy('is_popular', 'desc')
            ->orderBy('is_airport', 'desc')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($location) {
                // Count available cars at this location
                $availableCars = Car::where('location_id', $location->id)
                    ->where('status', 'available')
                    ->count();

                return [
                    'id' => $location->id,
                    'name' => $location->name,
                    'slug' => $location->slug,
                    'description' => $location->description,
                    'address' => $location->address,
                    'latitude' => $location->latitude,
                    'longitude' => $location->longitude,
                    'phone' => $location->phone,
                    'email' => $location->email,
                    'opening_time' => $location->opening_time,
                    'closing_time' => $location->closing_time,
                    'is_24_7' => $location->is_24_7,
                    'is_airport' => $location->is_airport,
                    'is_popular' => $location->is_popular,
                    'available_cars' => $availableCars,
                ];
            });

        return Inertia::render('customer/locations', [
            'locations' => $locations,
            'stats' => [
                'total_locations' => $locations->count(),
                'airport_locations' => $locations->where('is_airport', true)->count(),
                'popular_locations' => $locations->where('is_popular', true)->count(),
                'total_cars' => Car::where('status', 'available')->count(),
            ],
        ]);
    }
}
