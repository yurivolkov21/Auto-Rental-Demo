<?php

namespace App\Http\Controllers\Settings;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\UserVerification;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Settings\VerificationUpdateRequest;

class VerificationController extends Controller
{
    /**
     * Show the user's verification settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Load or create verification record with default status
        $verification = $user->verification ?? new UserVerification([
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);

        // Format dates for HTML date inputs
        $licenseIssueDate  = null;
        $licenseExpiryDate = null;

        if ($verification->license_issue_date instanceof \Carbon\Carbon) {
            $licenseIssueDate = $verification->license_issue_date->format('Y-m-d');
        }

        if ($verification->license_expiry_date instanceof \Carbon\Carbon) {
            $licenseExpiryDate = $verification->license_expiry_date->format('Y-m-d');
        }

        return Inertia::render('settings/verification', [
            'verification' => array_merge($verification->toArray(), [
                'license_issue_date'  => $licenseIssueDate,
                'license_expiry_date' => $licenseExpiryDate,
            ]),
        ]);
    }

    /**
     * Update the user's verification information.
     */
    public function update(VerificationUpdateRequest $request): RedirectResponse
    {
        /** @var \App\Models\User */
        $user = Auth::user();
        $data = $request->validated();

        // Get or create verification record with default status
        $verification = $user->verification ?? new UserVerification([
            'user_id' => $user->id,
            'status'  => 'pending',
        ]);

        // Handle license front image upload
        if (isset($data['license_front_image']) && $data['license_front_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($verification->license_front_image && Storage::disk('public')->exists($verification->license_front_image)) {
                Storage::disk('public')->delete($verification->license_front_image);
            }

            // Store new image
            $data['license_front_image'] = $data['license_front_image']->store('verifications/licenses', 'public');
        } else {
            unset($data['license_front_image']);
        }

        // Handle license back image upload
        if (isset($data['license_back_image']) && $data['license_back_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($verification->license_back_image && Storage::disk('public')->exists($verification->license_back_image)) {
                Storage::disk('public')->delete($verification->license_back_image);
            }

            // Store new image
            $data['license_back_image'] = $data['license_back_image']->store('verifications/licenses', 'public');
        } else {
            unset($data['license_back_image']);
        }

        // Handle ID card front image upload
        if (isset($data['id_card_front_image']) && $data['id_card_front_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($verification->id_card_front_image && Storage::disk('public')->exists($verification->id_card_front_image)) {
                Storage::disk('public')->delete($verification->id_card_front_image);
            }

            // Store new image
            $data['id_card_front_image'] = $data['id_card_front_image']->store('verifications/ids', 'public');
        } else {
            unset($data['id_card_front_image']);
        }

        // Handle ID card back image upload
        if (isset($data['id_card_back_image']) && $data['id_card_back_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($verification->id_card_back_image && Storage::disk('public')->exists($verification->id_card_back_image)) {
                Storage::disk('public')->delete($verification->id_card_back_image);
            }

            // Store new image
            $data['id_card_back_image'] = $data['id_card_back_image']->store('verifications/ids', 'public');
        } else {
            unset($data['id_card_back_image']);
        }

        // Handle selfie image upload
        if (isset($data['selfie_image']) && $data['selfie_image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($verification->selfie_image && Storage::disk('public')->exists($verification->selfie_image)) {
                Storage::disk('public')->delete($verification->selfie_image);
            }

            // Store new image
            $data['selfie_image'] = $data['selfie_image']->store('verifications/selfies', 'public');
        } else {
            unset($data['selfie_image']);
        }

        // Set status to pending when user submits/updates
        if ($verification->status !== 'verified') {
            $data['status'] = 'pending';
        }

        // Fill and save
        $verification->fill($data);
        $verification->user_id = $user->id;
        $verification->save();

        return to_route('verification.edit')->with('status', 'verification-updated');
    }
}
