<?php

use Illuminate\Support\Facades\DB;
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
        Schema::create('cars', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade'); // Car owner (role: owner)
            $table->foreignId('category_id')->constrained('car_categories')->onDelete('restrict'); // e.g., SUV, Sedan
            $table->foreignId('brand_id')->constrained('car_brands')->onDelete('restrict'); // e.g., Toyota, Ford
            $table->foreignId('location_id')->nullable()->constrained('locations')->onDelete('restrict'); // Base pickup location (optional)

            // Basic Information
            $table->string('name')->nullable(); // Display name (auto-generated from brand + model if null)
            $table->string('model');           // Model name (e.g., "Camry XSE", "Civic Type R")
            $table->string('color', 50)->nullable(); // Exterior color (e.g., "Red", "Pearl White")
            $table->unsignedSmallInteger('year');           // Manufacturing year (e.g., 2023, max 65535)
            $table->string('license_plate', 20)->unique();    // Unique license plate number
            $table->string('vin', 17)->nullable()->unique(); // Vehicle Identification Number (17 chars, nullable for regions without VIN)
            $table->unsignedTinyInteger('seats'); // Number of seats (max 255, typically 2-9)

            // Technical Specifications
            $table->enum('transmission', ['manual', 'automatic']);                  // Transmission type
            $table->enum('fuel_type', ['petrol', 'diesel', 'electric', 'hybrid']); // Fuel/energy type
            $table->unsignedInteger('odometer_km')->default(0);                     // Current odometer reading in kilometers

            // Documents & Compliance
            $table->date('insurance_expiry')->nullable();     // Insurance expiration date
            $table->date('registration_expiry')->nullable(); // Vehicle registration expiration date

            // Maintenance Tracking
            $table->date('last_maintenance_date')->nullable();           // Last service date
            $table->unsignedInteger('next_maintenance_km')->nullable(); // Kilometers for next scheduled maintenance

            // Rental Settings
            $table->boolean('is_delivery_available')->default(true); // Can car be delivered to customer?

            // Status & Verification
            $table->enum('status', ['available', 'rented', 'maintenance', 'inactive'])->default('available');                                           // Current rental status
            $table->boolean('is_verified')->default(false); // Admin verification status

            // Description & Features
            $table->text('description')->nullable(); // Detailed car description (marketing copy)
            $table->json('features')->nullable();   // Additional features JSON (e.g., {"gps": true, "bluetooth": true, "backup_camera": true})

            // Pricing Configuration (Hybrid: Hourly + Daily with auto-conversion)
            $table->decimal('hourly_rate', 10, 2); // Hourly rate for short rentals (required)
            $table->decimal('daily_rate', 10, 2); // Daily rate for long rentals (required)
            $table->unsignedTinyInteger('daily_hour_threshold')->default(10);     // Auto-convert to daily after X hours (e.g., 10h = 1 day)
            $table->decimal('deposit_amount', 10, 2)->default(0); // Security deposit
            $table->unsignedSmallInteger('min_rental_hours')->default(4);       // Minimum rental duration (e.g., 4 hours)
            $table->decimal('overtime_fee_per_hour', 10, 2)->default(0); // Late return fee per hour

            // Delivery Configuration
            $table->decimal('delivery_fee_per_km', 10, 2)->nullable(); // Delivery cost per km (owner sets, e.g., 15000 VND/km)
            $table->unsignedSmallInteger('max_delivery_distance')->nullable();       // Max delivery range in km (owner sets, e.g., 20km)

            // Performance Metrics (denormalized for quick access)
            $table->unsignedInteger('rental_count')->default(0);          // Total completed rentals (for popularity)
            $table->decimal('average_rating', 3, 2)->nullable(); // Average customer rating (0.00 - 5.00)

            $table->timestamps(); // Created at & updated at

            // Indexes for query performance
            $table->index(['status', 'is_verified']); // Available verified cars
            $table->index(['owner_id', 'status']); // Owner's car list by status
            $table->index(['category_id', 'status']); // Category filtering
            $table->index(['brand_id', 'status']); // Brand filtering
            $table->index(['location_id', 'status']); // Location-based search
            $table->index('daily_rate'); // Price sorting
            $table->index(['status', 'daily_rate']); // Available cars by price range
            $table->index('rental_count'); // Popular cars (most rented)
            $table->index('average_rating'); // Top-rated cars
            $table->index(['status', 'average_rating']); // Available top-rated cars
        });

        // Full-text search index for car search (name, model, description)
        DB::statement('ALTER TABLE cars ADD FULLTEXT fulltext_search (model, description)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
