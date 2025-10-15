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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('code', 20)->unique(); // Unique promotion code (max 20 chars)
            $table->string('name');                      // Promotion name
            $table->text('description')->nullable();    // Description of the promotion

            // Discount Configuration
            $table->enum('discount_type', [
                'percentage',
                'fixed_amount'
            ]);                                                                          // Type of discount
            $table->decimal('discount_value', 10, 2);            // Value of the discount
            $table->decimal('max_discount', 10, 2)->nullable(); // Maximum discount amount (for percentage)

            // Requirements
            $table->decimal('min_amount', 10, 2)->default(0); // Minimum order amount
            $table->integer('min_rental_hours')->default(4);                // Minimum rental duration in hours

            // Usage Limits
            $table->integer('max_uses')->nullable();                  // Maximum number of times the promotion can be used (null = unlimited)
            $table->integer('max_uses_per_user')->default(1); // Max uses per user
            $table->integer('used_count')->default(0);       // How many times the promotion has been used

            // Validity Period
            $table->datetime('start_date'); // Promotion start date & time
            $table->datetime('end_date');  // Promotion end date & time

            // Status & Features
            $table->enum('status', [
                'active',
                'paused',
                'upcoming',
                'archived'
            ])->default('active');                                     // Promotion status (archived = cannot be used anymore)
            $table->boolean('is_auto_apply')->default(false); // Auto-apply without code input
            $table->boolean('is_featured')->default(false);  // Display prominently on homepage
            $table->integer('priority')->default(0);        // Priority for applying (lower = higher priority)

            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who created the promotion
            $table->timestamps(); // Created at & updated at

            // Indexes for performance
            $table->index(['code', 'status']);                    // Quick lookup by code and status
            $table->index(['start_date', 'end_date', 'status']); // Date range queries
            $table->index('used_count');                        // Track usage statistics
            $table->index(['is_featured', 'status']);          // Featured promotions queries
            $table->index('priority');                        // Sort by priority
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
