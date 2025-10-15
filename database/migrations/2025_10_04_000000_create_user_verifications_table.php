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
        Schema::create('user_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Link to users table

            // Driving license information
            $table->string('driving_license_number', 50)->nullable(); // License number (max 50 chars)
            $table->text('license_front_image')->nullable();                 // License front side (for drivers: detailed verification)
            $table->text('license_back_image')->nullable();                // License back side (for drivers: detailed verification)
            $table->string('license_type', 20)->nullable();       // License type (A1, A2, B1, B2, C, D, E, etc.)
            $table->date('license_issue_date')->nullable();                          // Issue date
            $table->date('license_expiry_date')->nullable();                        // Expiry date
            $table->string('license_issued_country', 100)->nullable();     // Country of issue
            $table->unsignedSmallInteger('driving_experience_years')->nullable(); // Years of driving experience (for drivers)

            // Identity verification
            $table->text('id_card_front_image')->nullable();           // ID card front side (CCCD/CMND)
            $table->text('id_card_back_image')->nullable();           // ID card back side (CCCD/CMND)
            $table->text('selfie_image')->nullable();                // Selfie for facial recognition URL
            $table->string('nationality', 100)->nullable(); // User's nationality

            // Verification status
            $table->enum('status', [
                'pending',
                'verified',
                'rejected',
                'expired'
            ])->default('pending'); // Status

            // Audit fields
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who verified
            $table->timestamp('verified_at')->nullable(); // Timestamp of verification
            $table->foreignId('rejected_by')->nullable()->constrained('users')->onDelete('set null'); // Admin who rejected
            $table->timestamp('rejected_at')->nullable();  // Timestamp of rejection
            $table->text('rejected_reason')->nullable();  // Reason for rejection

            $table->timestamps(); // Created at & updated at

            // Indexes and constraints
            $table->unique('user_id');  // One user can only have one verification record
            $table->index('status');   // Frequently queried field
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_verifications');
    }
};
