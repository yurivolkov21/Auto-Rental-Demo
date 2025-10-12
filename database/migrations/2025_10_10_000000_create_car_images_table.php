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
        Schema::create('car_images', function (Blueprint $table) {
            $table->id();

            // Relationship
            $table->foreignId('car_id')->constrained('cars')->onDelete('cascade'); // Link to cars table

            // Image Information
            $table->string('image_path', 500); // Full path/URL to image file
            $table->string('alt_text')->nullable();   // Alternative text for SEO & accessibility
            $table->boolean('is_primary')->default(false);           // Primary display image flag
            $table->unsignedSmallInteger('sort_order')->default(0); // Gallery display order (max 65535)

            $table->timestamps(); // Created at & updated at

            // Indexes for performance
            $table->index('car_id'); // Fetch all images for a specific car
            $table->index(['car_id', 'is_primary']); // Quick primary image lookup
            $table->index(['car_id', 'sort_order']); // Ordered gallery display
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_images');
    }
};
