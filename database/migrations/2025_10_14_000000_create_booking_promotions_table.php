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
        Schema::create('booking_promotions', function (Blueprint $table) {
            $table->id();

            // === RELATIONSHIPS ===
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');      // Link to bookings table
            $table->foreignId('promotion_id')->constrained('promotions')->onDelete('cascade'); // Link to promotions table
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();        // User who applied the promotion (customer or admin)

            // === PROMOTION SNAPSHOT (captured at booking time) ===
            $table->string('promotion_code', 50);              // Promotion code at booking time
            $table->decimal('discount_amount', 10, 2); // Actual discount amount applied to this booking
            $table->text('promotion_details')->nullable();           // JSON snapshot of promotion details (name, type, value, etc.)

            // === TRACKING ===
            $table->timestamp('applied_at')->useCurrent(); // When the promotion was applied

            $table->timestamps(); // Created at & updated at

            // === INDEXES ===
            $table->unique(['booking_id', 'promotion_id']); // One promotion can only be applied once per booking
            $table->index(['promotion_id', 'created_at']); // Track promotion usage over time
            $table->index('booking_id');                  // Quick lookup for booking promotions
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_promotions');
    }
};
