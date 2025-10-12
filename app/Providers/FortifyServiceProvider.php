<?php

namespace App\Providers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Laravel\Fortify\Fortify;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Custom authentication logic with status check
        Fortify::authenticateUsing(function (Request $request) {
            $user = User::where('email', $request->email)->first();

            // Validate credentials
            if (!$user || !Hash::check($request->password, $user->password)) {
                return null;
            }

            // Check if user account is suspended or banned
            if ($user->isRestricted()) {
                $message = match ($user->status) {
                    'suspended' => 'Your account has been temporarily suspended.',
                    'banned'    => 'Your account has been permanently banned.',
                    default     => 'Your account has been restricted.',
                };

                // Add reason if available
                if ($user->status_note) {
                    $message .= " Reason: {$user->status_note}";
                }

                // Add contact info for appeal
                $message .= " Please contact support if you believe this is an error.";

                throw ValidationException::withMessages([
                    'email' => [$message],
                ]);
            }

            return $user;
        });

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
