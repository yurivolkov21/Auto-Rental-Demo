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
        Schema::create('car_brands', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('name', 100);               // Brand name (e.g., "Toyota", "Honda", "Ford")
            $table->string('slug', 150)->unique();    // URL-friendly identifier
            $table->string('logo', 500)->nullable(); // Brand logo URL/path

            // Display & Status
            $table->boolean('is_active')->default(true);             // Active status
            $table->unsignedSmallInteger('sort_order')->default(0); // Sort order (max 65535)

            $table->timestamps(); // Created at & updated at

            // Indexes for performance
            $table->index('is_active');                  // Filter active brands
            $table->index(['is_active', 'sort_order']); // Active brands ordered
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_brands');
    }
};
