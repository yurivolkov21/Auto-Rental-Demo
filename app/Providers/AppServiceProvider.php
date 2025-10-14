<?php

namespace App\Providers;

use App\Models\Booking;
use App\Services\BookingPricingService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register BookingPricingService as singleton
        $this->app->singleton(BookingPricingService::class, function ($app) {
            return new BookingPricingService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register the default password validation rules.
        Password::defaults(function () {
            return Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols();
        });

        // Share pending bookings count with all admin pages
        Inertia::share([
            'pendingBookingsCount' => function () {
                if (Auth::check() && Auth::user()->role === 'admin') {
                    return Booking::where('status', 'pending')->count();
                }
                return 0;
            },
        ]);
    }
}
