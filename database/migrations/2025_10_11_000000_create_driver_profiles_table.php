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
        Schema::create('driver_profiles', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');      // Driver user (role='driver')
            $table->foreignId('owner_id')->nullable()->constrained('users')->onDelete('set null'); // Car owner who employs this driver (nullable = independent driver)

            // === PRICING CONFIGURATION ===
            $table->decimal('hourly_fee', 10, 2)->default(0);  // Driver fee per hour (e.g., 50,000 VND)
            $table->decimal('daily_fee', 10, 2)->default(0);  // Driver fee per day (e.g., 400,000 VND)
            $table->decimal('overtime_fee_per_hour', 10, 2)->default(0); // Extra fee for overtime work
            $table->unsignedTinyInteger('daily_hour_threshold')->default(10);          // Hours threshold to switch to daily rate (default: 10 hours)

            // === AVAILABILITY & STATUS ===
            $table->enum('status', ['available', 'on_duty', 'off_duty', 'suspended'])->default('available'); // Current driver status
            $table->json('working_hours')->nullable(); // Working schedule JSON (e.g., {"mon": "8-18", "tue": "8-18", "sat": "8-12", "sun": "off"})
            $table->boolean('is_available_for_booking')->default(true); // Can customers book this driver?

            // === PERFORMANCE METRICS (Denormalized for quick access) ===
            $table->unsignedInteger('completed_trips')->default(0);       // Total completed bookings
            $table->decimal('average_rating', 3, 2)->nullable(); // Average customer rating (0.00 - 5.00)
            $table->unsignedInteger('total_km_driven')->default(0);     // Total kilometers driven (for experience tracking)
            $table->unsignedInteger('total_hours_driven')->default(0); // Total hours driven

            $table->timestamps(); // Created at & updated at

            // Indexes for query performance
            $table->index(['status', 'is_available_for_booking']); // Available drivers for booking
            $table->index('owner_id');                            // Owner's driver list
            $table->index('average_rating');                     // Top-rated drivers
            $table->index(['user_id', 'status']);               // Driver status lookup
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
};
