<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserVerification extends Model
{
    /** @use HasFactory<\Database\Factories\UserVerificationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'driving_license_number',
        'license_front_image',
        'license_back_image',
        'license_type',
        'license_issue_date',
        'license_expiry_date',
        'license_issued_country',
        'driving_experience_years',
        'id_card_front_image',
        'id_card_back_image',
        'selfie_image',
        'nationality',
        'status',
        'verified_by',
        'verified_at',
        'rejected_by',
        'rejected_at',
        'rejected_reason',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'license_issue_date'          => 'date',
            'license_expiry_date'         => 'date',
            'driving_experience_years'    => 'integer',
            'verified_at'                 => 'datetime',
            'rejected_at'                 => 'datetime',
        ];
    }

    /**
     * Get the user that owns the verification.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the admin who verified this record.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the admin who rejected this record.
     */
    public function rejector()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}
