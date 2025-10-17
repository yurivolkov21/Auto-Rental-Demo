<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Google\GoogleController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\BookingController;

// Customer Routes
Route::get('/', [HomeController::class, 'index'])->name('home');

// Car browsing routes (public)
Route::prefix('cars')->name('cars.')->group(function () {
    Route::get('/', [CarController::class, 'index'])->name('index');
    Route::get('/{id}', [CarController::class, 'show'])->name('show');
});

// Booking routes (guest allowed)
Route::prefix('booking')->name('booking.')->group(function () {
    Route::get('/checkout', [BookingController::class, 'checkout'])->name('checkout');
    Route::post('/calculate', [BookingController::class, 'calculate'])->name('calculate');
    Route::post('/validate-promotion', [BookingController::class, 'validatePromotion'])->name('validate-promotion');
    Route::post('/store', [BookingController::class, 'store'])->name('store');
    Route::get('/{id}/confirmation', [BookingController::class, 'confirmation'])->name('confirmation');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
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

