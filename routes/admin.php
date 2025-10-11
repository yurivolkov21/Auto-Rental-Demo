<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\LocationController;

/**
 * Admin Routes
 *
 * All routes in this file require:
 * - Authentication (user must be logged in)
 * - Admin role (user.role must be 'admin')
 */

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {

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
        Route::delete('/{location}', [LocationController::class, 'destroy'])->name('destroy');
        Route::post('/{location}/toggle-status', [LocationController::class, 'toggleStatus'])->name('toggle-status');
    });

});
