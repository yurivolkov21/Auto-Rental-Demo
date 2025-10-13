<?php

namespace App\Http\Controllers\Settings;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Http\Requests\Settings\ProfileUpdateRequest;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // Format date_of_birth for HTML date input
        $dateOfBirth = null;
        if ($user->date_of_birth instanceof \Carbon\Carbon) {
            $dateOfBirth = $user->date_of_birth->format('Y-m-d');
        }

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status'          => $request->session()->get('status'),
            'user'            => [
                'date_of_birth' => $dateOfBirth,
            ],
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $data = $request->validated();

        // Handle avatar upload
        if (isset($data['avatar']) && $data['avatar'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Store new avatar
            $data['avatar'] = $data['avatar']->store('avatars', 'public');
        } else {
            // Remove avatar from data if not uploaded
            unset($data['avatar']);
        }

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }
}
