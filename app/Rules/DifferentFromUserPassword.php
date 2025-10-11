<?php

namespace App\Rules;

use Closure;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\ValidationRule;

class DifferentFromUserPassword implements ValidationRule
{
    public function __construct(private string $email) {
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $user = User::where('email', $this->email)->first();

        if ($user && Hash::check($value, $user->password)) {
            $fail('The new password must be different from your previous password.');
        }
    }
}
