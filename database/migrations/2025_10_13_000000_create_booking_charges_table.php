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
        Schema::create('booking_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade'); // Link to bookings table

            // === RENTAL DURATION ===
            $table->unsignedSmallInteger('total_hours')->default(0); // Total rental duration in hours (max 65535)
            $table->unsignedSmallInteger('total_days')->default(0); // Total rental duration in days (converted from hours)

            // === CAR RENTAL CHARGES ===
            $table->decimal('hourly_rate', 10, 2)->nullable(); // Snapshot: hourly rate at booking time
            $table->decimal('daily_rate', 10, 2)->nullable(); // Snapshot: daily rate at booking time
            $table->decimal('base_amount', 10, 2);           // Base car rental amount (calculated from hours/days)

            // === ADDITIONAL CHARGES ===
            $table->decimal('delivery_fee', 10, 2)->default(0);       // Car delivery fee charged
            $table->decimal('driver_fee_amount', 10, 2)->default(0); // Total driver service fee
            $table->decimal('extra_fee', 10, 2)->default(0);        // Additional fees (overtime, damages, cleaning, etc.)
            $table->text('extra_fee_details')->nullable();                               // JSON breakdown of extra fees (e.g., {"overtime": 100000, "cleaning": 50000})

            // === DISCOUNTS & PROMOTIONS ===
            $table->decimal('discount_amount', 10, 2)->default(0); // Total discount amount from promotions

            // === FINANCIAL CALCULATION ===
            $table->decimal('subtotal', 10, 2);                        // Subtotal before tax (base + delivery + driver + extra - discount)
            $table->decimal('vat_amount', 10, 2)->default(0); // VAT/Tax amount (e.g., 10% of subtotal)
            $table->decimal('total_amount', 10, 2);                 // Grand total amount (subtotal + vat)

            // === PAYMENT TRACKING ===
            $table->decimal('deposit_amount', 10, 2)->default(0);   // Deposit paid upfront (snapshot from car)
            $table->decimal('amount_paid', 10, 2)->default(0);     // Total amount already paid by customer
            $table->decimal('balance_due', 10, 2)->default(0);    // Remaining amount to be paid (total - amount_paid - deposit)
            $table->decimal('refund_amount', 10, 2)->default(0); // Refund amount if applicable (cancellation, overpayment)

            $table->timestamps(); // Created at & updated at

            // === INDEXES ===
            $table->unique('booking_id');   // One-to-one relationship with bookings
            $table->index('total_amount'); // Financial reporting queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_charges');
    }
};
