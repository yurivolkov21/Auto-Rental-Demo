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
        Schema::create('car_categories', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name', 100);            // Category name (e.g., "SUV", "Sedan", "Hatchback")
            $table->string('slug', 150)->unique(); // URL-friendly identifier
            $table->string('icon', 50)->default('car'); // Icon class/name for UI display
            $table->text('description')->nullable();                  // Category description (SEO & customer info)

            // Display & Status
            $table->boolean('is_active')->default(true);             // Is category active?
            $table->unsignedSmallInteger('sort_order')->default(0); // Display order (max 65535)

            $table->timestamps(); // Created at & updated at

            // Indexes for performance
            $table->index('is_active'); // Filter active categories
            $table->index(['is_active', 'sort_order']); // Active categories ordered
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_categories');
    }
};
