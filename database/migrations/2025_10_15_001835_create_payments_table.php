<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id', 100)->unique(); // PayPal transaction ID / Order ID

            // === RELATIONSHIPS ===
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Who made the payment

            // === PAYMENT DETAILS ===
            $table->enum('payment_method', [
                'cash',
                'paypal',
                'credit_card',
                'bank_transfer',
                'wallet'
            ])->default('cash');

            $table->enum('payment_type', [
                'deposit',       // Initial deposit payment
                'full_payment', // Full payment at once
                'partial',     // Partial payment
                'refund'      // Refund transaction
            ])->default('deposit');

            // === AMOUNT & CURRENCY (DUAL CURRENCY STORAGE) ===
            $table->decimal('amount', 10, 2)->comment('Deprecated - use amount_vnd'); // Legacy field for backward compatibility
            $table->decimal('amount_vnd', 12, 2); // Primary amount in VND (Vietnam Dong)
            $table->decimal('amount_usd', 10, 2); // Amount in USD (for PayPal/international payments)
            $table->decimal('exchange_rate', 10, 4)->comment('Exchange rate at payment time (1 USD = X VND)'); // Rate used for conversion
            $table->string('currency', 3)->default('VND'); // Primary currency (VND)

            // === STATUS ===
            $table->enum('status', [
                'pending',      // Payment initiated but not confirmed
                'completed',   // Successfully completed
                'failed',     // Payment failed
                'refunded',  // Payment refunded
                'cancelled' // Payment cancelled
            ])->default('pending');

            // === PAYPAL SPECIFIC ===
            $table->string('paypal_order_id', 100)->nullable();      // PayPal Order ID
            $table->string('paypal_payer_id', 100)->nullable();     // PayPal Payer ID
            $table->string('paypal_payer_email', 150)->nullable(); // Payer's PayPal email
            $table->text('paypal_response')->nullable();                  // Full PayPal response (JSON)

            // === METADATA ===
            $table->text('notes')->nullable();             // Additional notes
            $table->datetime('paid_at')->nullable();      // When payment was completed
            $table->datetime('refunded_at')->nullable(); // When payment was refunded

            $table->timestamps();

            // === INDEXES ===
            $table->index(['booking_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index('payment_method');
            $table->index('status');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
