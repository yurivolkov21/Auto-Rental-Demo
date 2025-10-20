<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('customer/services', [
            'stats' => [
                'total_cars' => \App\Models\Car::count(),
                'total_drivers' => \App\Models\DriverProfile::where('is_available_for_booking', true)->count(),
                'total_locations' => \App\Models\Location::count(),
                'years_in_business' => 8,
            ],
        ]);
    }
}
