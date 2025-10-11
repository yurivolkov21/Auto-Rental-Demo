<?php

namespace App\Rules;

use Closure;
use Illuminate\Support\Facades\Hash;
use Illuminate\Contracts\Validation\ValidationRule;

class DifferentFromCurrentPassword implements ValidationRule
{
    public function __construct(private string $currentPassword) {
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (Hash::check($value, $this->currentPassword)) {
            $fail('The new password must be different from your current password.');
        }
    }
}
