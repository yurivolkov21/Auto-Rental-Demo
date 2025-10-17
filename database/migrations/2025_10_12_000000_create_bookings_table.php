<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code', 20)->unique(); // Unique booking code (e.g., "BK-2025-001234")

            // === RELATIONSHIPS ===
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');   // Customer who made the booking
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade'); // Car owner
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');   // The car being rented

            // Admin/Staff tracking (separate fields for better audit trail)
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();  // Admin who confirmed the booking
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete(); // User/Admin who cancelled

            // Locations
            $table->foreignId('pickup_location_id')->constrained('locations')->onDelete('restrict');  // Pickup location
            $table->foreignId('return_location_id')->constrained('locations')->onDelete('restrict'); // Return location

            // === RENTAL PERIOD ===
            $table->datetime('pickup_datetime');  // Scheduled pickup date & time
            $table->datetime('return_datetime'); // Scheduled return date & time
            $table->datetime('actual_pickup_time')->nullable();  // Actual pickup date & time (when status = active)
            $table->datetime('actual_return_time')->nullable(); // Actual return date & time (when status = completed)

            // === PRICING SNAPSHOTS (captured at booking time) ===
            $table->decimal('hourly_rate', 10, 2); // Car hourly rate snapshot
            $table->decimal('daily_rate', 10, 2); // Car daily rate snapshot
            $table->unsignedTinyInteger('daily_hour_threshold')->default(10);     // Threshold for daily conversion (e.g., 10 hours)
            $table->decimal('deposit_amount', 10, 2)->default(0); // Deposit amount snapshot

            // === DRIVER SERVICE ===
            $table->boolean('with_driver')->default(false); // Is driver service requested?
            $table->foreignId('driver_profile_id')->nullable()->constrained('driver_profiles')->onDelete('restrict'); // Assigned driver (if with_driver = true)
            $table->decimal('driver_hourly_fee', 10, 2)->nullable();  // Driver hourly fee snapshot
            $table->decimal('driver_daily_fee', 10, 2)->nullable();  // Driver daily fee snapshot
            $table->unsignedSmallInteger('total_driver_hours')->default(0); // Total hours driver worked (for overtime tracking)
            $table->text('driver_notes')->nullable(); // Special notes about driver service

            // === DELIVERY SERVICE ===
            $table->boolean('is_delivery')->default(false); // Is car delivery requested?
            $table->text('delivery_address')->nullable();         // Delivery address if delivery is requested
            $table->decimal('delivery_distance', 10, 2)->nullable();    // Delivery distance in km (calculated)
            $table->decimal('delivery_fee_per_km', 10, 2)->nullable(); // Delivery rate snapshot

            // === STATUS & LIFECYCLE ===
            $table->enum('status', [
                'pending',    // Waiting for confirmation
                'confirmed',  // Confirmed by admin/owner
                'active',     // Currently in use
                'completed',  // Successfully completed
                'cancelled',  // Cancelled by customer
                'rejected'    // Rejected by admin/owner
            ])->default('pending');

            $table->datetime('confirmed_at')->nullable();  // When booking was confirmed
            $table->datetime('cancelled_at')->nullable(); // When booking was cancelled

            // === PAYMENT INFO ===
            $table->decimal('total_amount', 12, 2)->default(0); // Total booking amount
            $table->enum('payment_method', ['credit_card', 'paypal', 'bank_transfer'])->nullable(); // Payment method
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending'); // Payment status

            // === NOTES & REASONS ===
            $table->text('special_requests')->nullable();      // Customer's special requests
            $table->text('admin_notes')->nullable();          // Internal notes from admin
            $table->text('cancellation_reason')->nullable(); // Reason for cancellation/rejection

            $table->timestamps(); // Created at & updated at

            // === INDEXES FOR PERFORMANCE ===
            $table->index(['user_id', 'status']);   // Customer's booking history
            $table->index(['owner_id', 'status']); // Owner's booking management
            $table->index(['car_id', 'status']);  // Car availability check
            $table->index(['driver_profile_id', 'status']);         // Driver assignment lookup
            $table->index(['pickup_datetime', 'return_datetime']); // Date range queries
            $table->index(['status', 'created_at']); // Recent bookings by status
            $table->index('booking_code');          // Quick lookup by code
            $table->index(['pickup_location_id', 'status']); // Location-based queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
