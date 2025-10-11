<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Auth\EmailVerificationRequest as BaseEmailVerificationRequest;

/**
 * @method User|null user(string|null $guard = null)
 */
class EmailVerificationRequest extends BaseEmailVerificationRequest
{
    //
}
