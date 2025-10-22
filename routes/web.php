<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\Customer\AboutController;
use App\Http\Controllers\Customer\ContactController;
use App\Http\Controllers\Customer\ServiceController;
use App\Http\Controllers\Customer\LocationController;

// Customer Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/services', [ServiceController::class, 'index'])->name('services');
Route::get('/locations', [LocationController::class, 'index'])->name('locations');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// Car browsing routes (public)
Route::prefix('cars')->name('cars.')->group(function () {
    Route::get('/', [CarController::class, 'index'])->name('index');
    Route::get('/{id}', [CarController::class, 'show'])->name('show');
});

// Booking routes (require authentication)
Route::middleware(['auth'])->prefix('booking')->name('booking.')->group(function () {
    Route::get('/checkout', [BookingController::class, 'checkout'])->name('checkout');
    Route::post('/calculate', [BookingController::class, 'calculate'])->name('calculate');
    Route::post('/validate-promotion', [BookingController::class, 'validatePromotion'])->name('validate-promotion');
    Route::post('/store', [BookingController::class, 'store'])->name('store');
    Route::get('/{id}/confirmation', [BookingController::class, 'confirmation'])->name('confirmation');
});

// Payment routes (require authentication)
Route::middleware(['auth'])->prefix('payment')->name('payment.')->group(function () {
    Route::post('/process', [\App\Http\Controllers\PaymentController::class, 'processPayment'])->name('process');
    Route::get('/paypal/success', [\App\Http\Controllers\PaymentController::class, 'paypalSuccess'])->name('paypal.success');
    Route::get('/paypal/cancel', [\App\Http\Controllers\PaymentController::class, 'paypalCancel'])->name('paypal.cancel');
    Route::get('/{id}', [\App\Http\Controllers\PaymentController::class, 'show'])->name('show');
});

// Customer Dashboard routes (require authentication)
Route::middleware(['auth'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Customer\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/bookings', [\App\Http\Controllers\Customer\BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{id}', [\App\Http\Controllers\Customer\BookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings/{id}/cancel', [\App\Http\Controllers\Customer\BookingController::class, 'cancel'])->name('bookings.cancel');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return redirect()->route('customer.dashboard');
    })->name('dashboard');
});

// Google OAuth Routes
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle'])
    ->name('auth.google');

Route::get('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback'])
    ->name('auth.google.callback');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';

