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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')
                ->unique() // One review per booking
                ->constrained('bookings')
                ->cascadeOnDelete();
            $table->foreignId('car_id')
                ->constrained('cars')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->comment('Reviewer')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->tinyInteger('rating')
                ->comment('Rating from 1 to 5');
            $table->text('comment');
            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->index();
            $table->text('response')->nullable();
            $table->foreignId('responded_by')
                ->nullable()
                ->comment('User who responded (owner/admin)')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('responded_at')->nullable();
            $table->boolean('is_verified_booking')
                ->default(false)
                ->comment('Booking completed and verified');
            $table->timestamps();

            // Indexes for performance
            $table->index('car_id');
            $table->index('user_id');
            $table->index('rating');
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
