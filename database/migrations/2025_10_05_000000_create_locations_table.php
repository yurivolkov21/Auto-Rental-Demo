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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name', 100);       // Location name
            $table->string('slug')->unique();         // URL-friendly identifier
            $table->text('description')->nullable(); // Location description for customers

            // Address Details
            $table->text('address')->nullable(); // Full address

            // Geographic Coordinates (for maps & distance calculations)
            $table->decimal('latitude', 10, 8)->nullable();   // Latitude (-90 to 90)
            $table->decimal('longitude', 11, 8)->nullable(); // Longitude (-180 to 180)

            // Contact Information
            $table->string('phone', 20)->nullable();   // Contact phone
            $table->string('email', 100)->nullable(); // Contact email

            // Operating Hours
            $table->time('opening_time')->nullable()->default('08:00:00');  // Opening time
            $table->time('closing_time')->nullable()->default('18:00:00'); // Closing time
            $table->boolean('is_24_7')->default(false); // 24/7 operation

            // Display & Status
            $table->boolean('is_airport')->default(false);        // Is this location at an airport?
            $table->boolean('is_popular')->default(false);       // Is this location popular?
            $table->boolean('is_active')->default(true);        // Is this location active?
            $table->unsignedInteger('sort_order')->default(0); // Display order

            $table->timestamps(); // Created at & updated at

            // Indexes for performance
            $table->index('is_active');                   // Filter active locations
            $table->index(['is_airport', 'is_active']);  // Airport location queries
            $table->index(['is_popular', 'is_active']); // Popular location queries
            $table->index(['latitude', 'longitude']);  // Geographic/distance queries
            $table->index('sort_order');              // Custom ordering
        });

        // Full-text search index for location search (name + address)
        DB::statement('ALTER TABLE locations ADD FULLTEXT fulltext_index (name, address)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
