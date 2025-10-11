<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\VerificationController;

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

});
