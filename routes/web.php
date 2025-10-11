<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Google\GoogleController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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

// Paypal
// Route::get('paypal', [PayPalController::class, 'index'])->name('paypal');
// Route::get('paypal/payment', [PayPalController::class, 'payment'])->name('paypal.payment');
// Route::get('paypal/payment/success', [PayPalController::class, 'paymentSuccess'])->name('paypal.payment.success');
// Route::get('paypal/payment/cancel', [PayPalController::class, 'paymentCancel'])->name('paypal.payment.cancel');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
