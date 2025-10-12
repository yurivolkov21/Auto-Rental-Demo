<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\CarController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CarBrandController;
use App\Http\Controllers\Admin\CarImageController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\PromotionController;
use App\Http\Controllers\Admin\CarCategoryController;
use App\Http\Controllers\Admin\VerificationController;

/**
 * Admin Routes
 *
 * All routes in this file require:
 * - Authentication (user must be logged in)
 * - Admin role (user.role must be 'admin')
 */

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

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
        Route::put('/{car}', [CarController::class, 'update'])->name('update');
        Route::post('/{car}/toggle-status', [CarController::class, 'toggleStatus'])->name('toggle-status');
    });

    // Car Image Management Routes (for admin managing car images)
    Route::prefix('cars/{car}/images')->name('car-images.')->group(function () {
        Route::post('/', [CarImageController::class, 'store'])->name('store');
        Route::patch('/{image}/set-primary', [CarImageController::class, 'setPrimary'])->name('set-primary');
        Route::post('/reorder', [CarImageController::class, 'reorder'])->name('reorder');
    });

});
