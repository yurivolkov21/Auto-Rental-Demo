<?php

namespace App\Http\Controllers\Google;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Redirect user to Google OAuth provider.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Get a valid avatar URL from Google user or generate a fallback.
     */
    private function getValidAvatar($googleUser): string
    {
        $avatar = $googleUser->getAvatar();

        // If avatar is empty or default, use UI Avatars as fallback
        if (empty($avatar) || str_contains($avatar, 'default')) {
            $name = urlencode($googleUser->getName() ?: 'User');
            return "https://ui-avatars.com/api/?name={$name}&color=7F9CF5&background=EBF4FF&size=200";
        }

        // Ensure avatar URL is larger (replace s96-c with s200-c if present)
        return str_replace('s96-c', 's200-c', $avatar);
    }

    /**
     * Handle Google OAuth callback and authenticate user.
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Validate that we have an email from Google
            if (!$googleUser->getEmail()) {
                throw new \Exception('Email not provided by Google');
            }
        } catch (\Throwable $e) {
            return redirect()
                ->route('login')
                ->withErrors(['google' => 'Unable to login using Google. Please try again or contact support.']);
        }

        // Find user by Google provider ID
        $user = User::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        // If not found by provider, check if email already exists
        if (!$user && $googleUser->getEmail()) {
            $user = User::where('email', $googleUser->getEmail())->first();
        }

        if (!$user) {
            // Create new user from Google account
            $user = User::create([
                'name'              => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'email'             => $googleUser->getEmail(),
                'password'          => Hash::make(Str::random(32)), // Random password for OAuth users
                'provider'          => 'google',
                'provider_id'       => $googleUser->getId(),
                'avatar'            => $this->getValidAvatar($googleUser),
                'email_verified_at' => now(),
                'role'              => 'customer', // Default role
                'status'            => 'active', // Only set active for NEW users
            ]);
        } else {
            // SECURITY: Check if existing user is suspended or banned
            if (in_array($user->status, ['suspended', 'banned'])) {
                return redirect()
                    ->route('login')
                    ->withErrors([
                        'email' => $user->status === 'suspended'
                            ? 'Your account has been suspended. Please contact support for assistance.'
                            : 'Your account has been permanently banned and cannot be accessed.',
                    ]);
            }

            // Update existing user with Google info (DO NOT change status)
            $user->update([
                'name'              => $googleUser->getName() ?: $googleUser->getNickname() ?: $user->name,
                'provider'          => 'google',
                'provider_id'       => $googleUser->getId(),
                'avatar'            => $this->getValidAvatar($googleUser),
                'email_verified_at' => $user->email_verified_at ?: now(),
                // Removed status update to preserve existing status
            ]);
        }

        // Login the user
        Auth::login($user, true);

        // Redirect to dashboard
        return redirect()
            ->intended(route('dashboard'))
            ->with('status', 'Successfully logged in with Google!');
    }
}
