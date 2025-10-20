<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('customer/about', [
            'stats' => [
                'years_in_business' => 8,
                'total_cars' => \App\Models\Car::count(),
                'total_locations' => \App\Models\Location::count(),
                'happy_customers' => \App\Models\User::where('role', 'customer')->count(),
                'total_bookings' => \App\Models\Booking::count(),
            ],
            'teamMembers' => [
                [
                    'name' => 'Nguyen Van A',
                    'position' => 'CEO & Founder',
                    'bio' => 'With over 10 years of experience in the automotive industry, leading AutoRental to become a trusted car rental service in Vietnam.',
                    'image' => null,
                ],
                [
                    'name' => 'Tran Thi B',
                    'position' => 'Operations Manager',
                    'bio' => 'Ensuring smooth operations and exceptional customer service across all locations.',
                    'image' => null,
                ],
                [
                    'name' => 'Le Van C',
                    'position' => 'Fleet Manager',
                    'bio' => 'Managing our premium fleet of vehicles, ensuring quality and safety standards.',
                    'image' => null,
                ],
                [
                    'name' => 'Pham Thi D',
                    'position' => 'Customer Success Lead',
                    'bio' => 'Dedicated to providing outstanding customer experiences and support.',
                    'image' => null,
                ],
            ],
        ]);
    }
}
