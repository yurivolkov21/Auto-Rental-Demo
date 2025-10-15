<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CarController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\CarBrandController;
use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\CarCategoryController;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\DriverProfileController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminDashboardController;

/**
 * Admin Routes
 *
 * All routes in this file require:
 * - Authentication (user must be logged in)
 * - Admin role (user.role must be 'admin')
 */

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // User Management Routes
    Route::prefix('users')->name('users.')->group(function () {
        // View & Edit (No delete - users are suspended/banned instead)
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');

        // Special Actions
        Route::post('/{user}/change-status', [UserController::class, 'changeStatus'])->name('change-status');
        Route::post('/{user}/change-role', [UserController::class, 'changeRole'])->name('change-role');
        Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
    });

    // Verification Management Routes
    Route::prefix('verifications')->name('verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{verification}', [VerificationController::class, 'show'])->name('show');
        Route::post('/{verification}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{verification}/reject', [VerificationController::class, 'reject'])->name('reject');
    });

    // Driver Profile Management Routes
    Route::prefix('driver-profiles')->name('driver-profiles.')->group(function () {
        Route::get('/', [DriverProfileController::class, 'index'])->name('index');
        Route::get('/{driverProfile}', [DriverProfileController::class, 'show'])->name('show');
        Route::get('/{driverProfile}/edit', [DriverProfileController::class, 'edit'])->name('edit');
        Route::put('/{driverProfile}', [DriverProfileController::class, 'update'])->name('update');
        Route::post('/{driverProfile}/update-status', [DriverProfileController::class, 'updateStatus'])->name('update-status');
        Route::post('/{driverProfile}/toggle-availability', [DriverProfileController::class, 'toggleAvailability'])->name('toggle-availability');
    });

    // Location Management Routes
    Route::prefix('locations')->name('locations.')->group(function () {
        Route::get('/', [LocationController::class, 'index'])->name('index');
        Route::get('/create', [LocationController::class, 'create'])->name('create');
        Route::post('/', [LocationController::class, 'store'])->name('store');
        Route::get('/{location}', [LocationController::class, 'show'])->name('show');
        Route::get('/{location}/edit', [LocationController::class, 'edit'])->name('edit');
        Route::put('/{location}', [LocationController::class, 'update'])->name('update');
        Route::post('/{location}/toggle-status', [LocationController::class, 'toggleStatus'])->name('toggle-status');
    });

    // Promotion Management Routes
    Route::prefix('promotions')->name('promotions.')->group(function () {
        Route::get('/', [PromotionController::class, 'index'])->name('index');
        Route::get('/create', [PromotionController::class, 'create'])->name('create');
        Route::post('/', [PromotionController::class, 'store'])->name('store');
        Route::get('/{promotion}', [PromotionController::class, 'show'])->name('show');
        Route::get('/{promotion}/edit', [PromotionController::class, 'edit'])->name('edit');
        Route::put('/{promotion}', [PromotionController::class, 'update'])->name('update');
        Route::post('/{promotion}/toggle-status', [PromotionController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/{promotion}/archive', [PromotionController::class, 'archive'])->name('archive');
    });

    // Car Brand Management Routes
    Route::prefix('car-brands')->name('car-brands.')->group(function () {
        Route::get('/', [CarBrandController::class, 'index'])->name('index');
        Route::get('/create', [CarBrandController::class, 'create'])->name('create');
        Route::post('/', [CarBrandController::class, 'store'])->name('store');
        Route::get('/{carBrand}', [CarBrandController::class, 'show'])->name('show');
        Route::get('/{carBrand}/edit', [CarBrandController::class, 'edit'])->name('edit');
        Route::put('/{carBrand}', [CarBrandController::class, 'update'])->name('update');
        Route::post('/{carBrand}/toggle-status', [CarBrandController::class, 'toggleStatus'])->name('toggle-status');
    });

    // Car Category Management Routes
    Route::prefix('car-categories')->name('car-categories.')->group(function () {
        Route::get('/', [CarCategoryController::class, 'index'])->name('index');
        Route::get('/create', [CarCategoryController::class, 'create'])->name('create');
        Route::post('/', [CarCategoryController::class, 'store'])->name('store');
        Route::get('/{carCategory}', [CarCategoryController::class, 'show'])->name('show');
        Route::get('/{carCategory}/edit', [CarCategoryController::class, 'edit'])->name('edit');
        Route::put('/{carCategory}', [CarCategoryController::class, 'update'])->name('update');
        Route::post('/{carCategory}/toggle-status', [CarCategoryController::class, 'toggleStatus'])->name('toggle-status');
    });

    // Car Management Routes
    Route::prefix('cars')->name('cars.')->group(function () {
        Route::get('/', [CarController::class, 'index'])->name('index');
        Route::get('/create', [CarController::class, 'create'])->name('create');
        Route::post('/', [CarController::class, 'store'])->name('store');
        Route::get('/{car}', [CarController::class, 'show'])->name('show');
        Route::get('/{car}/edit', [CarController::class, 'edit'])->name('edit');
        Route::get('/{car}/images', [CarController::class, 'manageImages'])->name('images');
        Route::put('/{car}', [CarController::class, 'update'])->name('update');
        Route::post('/{car}/toggle-status', [CarController::class, 'toggleStatus'])->name('toggle-status');
    });

    // Car Image Management Routes (for admin managing car images)
    Route::prefix('cars/{car}/images')->name('car-images.')->group(function () {
        Route::post('/', [CarImageController::class, 'store'])->name('store');
        Route::patch('/{carImage}/set-primary', [CarImageController::class, 'setPrimary'])->name('set-primary');
        Route::post('/reorder', [CarImageController::class, 'reorder'])->name('reorder');
        Route::delete('/{carImage}', [CarImageController::class, 'destroy'])->name('destroy');
    });

    // Booking Management Routes (Admin)
    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', [BookingController::class, 'index'])->name('index');
        Route::get('/{booking}', [BookingController::class, 'show'])->name('show');
        Route::get('/{booking}/edit', [BookingController::class, 'edit'])->name('edit');
        Route::put('/{booking}', [BookingController::class, 'update'])->name('update');
        Route::delete('/{booking}', [BookingController::class, 'destroy'])->name('destroy');

        // Status Transition Routes
        Route::post('/{booking}/confirm', [BookingController::class, 'confirm'])->name('confirm');
        Route::post('/{booking}/reject', [BookingController::class, 'reject'])->name('reject');
        Route::post('/{booking}/activate', [BookingController::class, 'activate'])->name('activate');
        Route::post('/{booking}/complete', [BookingController::class, 'complete'])->name('complete');
    });

    // Payment Management Routes (Admin)
    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [AdminPaymentController::class, 'index'])->name('index');
        Route::get('/{payment}', [AdminPaymentController::class, 'show'])->name('show');
        Route::post('/{payment}/refund', [AdminPaymentController::class, 'refund'])->name('refund');
    });

    // Review Management Routes (Admin)
    Route::prefix('reviews')->name('reviews.')->group(function () {
        Route::get('/', [AdminReviewController::class, 'index'])->name('index');
        Route::get('/{review}', [AdminReviewController::class, 'show'])->name('show');
        Route::post('/{review}/approve', [AdminReviewController::class, 'approve'])->name('approve');
        Route::post('/{review}/reject', [AdminReviewController::class, 'reject'])->name('reject');
        Route::post('/{review}/respond', [AdminReviewController::class, 'respond'])->name('respond');
        Route::delete('/{review}', [AdminReviewController::class, 'destroy'])->name('destroy');
    });

});
