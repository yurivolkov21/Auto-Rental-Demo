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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');                             // User's full name
            $table->string('email')->unique();                  // Unique email address
            $table->string('password');                         // Hashed password
            $table->timestamp('email_verified_at')->nullable(); // Email verification timestamp

            // OAuth fields
            $table->string('provider', 50)->nullable(); // OAuth provider name (e.g., 'google', 'facebook')
            $table->string('provider_id')->nullable();          // OAuth provider user ID (can be long)

            // Two-factor authentication
            $table->text('two_factor_secret')->nullable();            // 2FA secret key
            $table->text('two_factor_recovery_codes')->nullable();    // 2FA recovery codes
            $table->timestamp('two_factor_confirmed_at')->nullable(); // 2FA confirmation timestamp

            // Profile information
            $table->text('avatar')->nullable();              // URL to avatar image
            $table->text('bio')->nullable();                 // Short biography
            $table->string('phone', 20)->nullable(); // Phone number (international format)
            $table->text('address')->nullable();             // Physical address
            $table->date('date_of_birth')->nullable();       // Date of birth

            // Role & status
            $table->enum('role', ['customer', 'owner', 'admin'])->default('customer'); // User role
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned'])->default('active'); // Account status

            // Account deletion
            $table->text('deletion_reason')->nullable();            // Reason for deletion
            $table->timestamp('deletion_requested_at')->nullable(); // When deletion was requested
            $table->timestamp('deleted_at')->nullable();            // When the account was deleted

            $table->rememberToken();
            $table->timestamps();

            // Indexes for better query performance
            $table->index('role');
            $table->index('status');
            $table->index(['provider', 'provider_id']);
            $table->index('deleted_at');
            $table->index('phone');

            // Composite unique constraint for OAuth
            $table->unique(['provider', 'provider_id'], 'oauth_unique');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
