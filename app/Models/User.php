<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'provider',
        'provider_id',
        'avatar',
        'bio',
        'phone',
        'address',
        'date_of_birth',
        'role',
        'status',
        'deletion_reason',
        'deletion_requested_at',
        'deleted_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factory_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at'       => 'datetime',
            'password'                => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'date_of_birth'           => 'date',
            'deletion_requested_at'   => 'datetime',
            'deleted_at'              => 'datetime',
        ];
    }

    /**
     * Get the user's verification record.
     */
    public function verification()
    {
        return $this->hasOne(UserVerification::class);
    }

    /**
     * Query Scopes
     */

    /**
     * Scope a query to only include customers.
     */
    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    /**
     * Scope a query to only include owners.
     */
    public function scopeOwners($query)
    {
        return $query->where('role', 'owner');
    }

    /**
     * Scope a query to only include admins.
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include verified users.
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope a query to eager load verification relationship.
     */
    public function scopeWithVerification($query)
    {
        return $query->with('verification');
    }

    /**
     * Scope a query to search by name, email, or phone.
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('email', 'like', "%{$term}%")
              ->orWhere('phone', 'like', "%{$term}%");
        });
    }

    /**
     * Helper Methods
     */

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is an owner.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if user is a customer.
     */
    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    /**
     * Check if user account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if user has verified their email.
     */
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Check if user has a verification record.
     */
    public function hasVerification(): bool
    {
        return !is_null($this->verification);
    }

    /**
     * Check if user's identity is verified.
     */
    public function isVerified(): bool
    {
        return $this->hasVerification() && $this->verification->status === 'verified';
    }

    /**
     * Check if user can rent cars (customer + verified).
     */
    public function canRentCars(): bool
    {
        return $this->isCustomer() && $this->isVerified();
    }

    /**
     * Check if user can list cars (owner + verified).
     */
    public function canListCars(): bool
    {
        return $this->isOwner() && $this->isVerified();
    }
}
