<?php

namespace App\Http\Controllers\Google;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    private function getValidAvatar($googleUser)
    {
        $avatar = $googleUser->getAvatar();

        // If avatar is empty or default, use UI Avatars
        if (!$avatar || $avatar === '' || strpos($avatar, 'default') !== false)
        {
            // Create a default avatar from the user's name using the UI Avatars service
            $name = urlencode($googleUser->getName() ?: 'User');

            $fallbackAvatar = "https://ui-avatars.com/api/?name={$name}&color=7F9CF5&background=EBF4FF&size=200";

            return $fallbackAvatar;
        }

        // Ensure avatar URL is larger (replace s96-c with s200-c if present)
        $avatar = str_replace('s96-c', 's200-c', $avatar);

        return $avatar;
    }

    public function handleGoogleCallback(Request $request)
    {
        Log::info('Google callback started');

        try
        {
            $googleUser = Socialite::driver('google')->user();
            Log::info('Google user retrieved', [
                'email'    => $googleUser->getEmail(),
                'name'     => $googleUser->getName(),
                'avatar'   => $googleUser->getAvatar(),
                'nickname' => $googleUser->getNickname(),
                'id'       => $googleUser->getId()
            ]);
        }
        catch (\Throwable $e)
        {
            return redirect()
                ->route('login')
                ->withErrors(['google' => 'Unable to login using Google. Please try again.']);
        }

        $user = User::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        if (!$user && $googleUser->getEmail())
        {
            $user = User::where('email', $googleUser->getEmail())->first();
        }

        if (!$user)
        {
            $user = User::create([
                'name'              => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'email'             => $googleUser->getEmail(),
                'password'          => Hash::make(Str::random(32)),
                'provider'          => 'google',
                'provider_id'       => $googleUser->getId(),
                'email_verified_at' => now(),
            ]);

            // Create user profile with avatar
            $user->profile()->create([
                'avatar' => $this->getValidAvatar($googleUser),
            ]);
        }
        else
        {
            $user->update([
                'name'              => $googleUser->getName() ?: $googleUser->getNickname() ?: 'Google User',
                'provider'          => 'google',
                'provider_id'       => $googleUser->getId(),
                'email_verified_at' => $user->email_verified_at ?: now(),
            ]);

            // Update profile avatar
            if ($user->profile)
            {
                $user->profile->update([
                    'avatar' => $this->getValidAvatar($googleUser),
                ]);
            }
            else
            {
                $user->profile()->create([
                    'avatar' => $this->getValidAvatar($googleUser),
                ]);
            }
        }

        Auth::login($user, true);

        // Redirect admin users to admin dashboard, others to regular dashboard
        $defaultRoute = $user->role === 'admin'
            ? route('admin.dashboard')
            : route('dashboard');

        return redirect()
            ->intended($defaultRoute)
            ->with('status', 'You have been logged in using Google.');
    }
}
