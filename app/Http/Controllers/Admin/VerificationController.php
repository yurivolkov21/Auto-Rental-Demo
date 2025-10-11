<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use App\Models\UserVerification;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

class VerificationController extends Controller
{
    /**
     * Display a listing of user verifications.
     */
    public function index(Request $request): Response
    {
        $query = UserVerification::with('user:id,name,email,avatar')
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by user name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $verifications = $query->paginate(15)->withQueryString();

        // Format dates for each verification
        $verifications->getCollection()->transform(function ($verification) {
            $licenseIssueDate  = null;
            $licenseExpiryDate = null;

            if ($verification->license_issue_date instanceof \Carbon\Carbon) {
                $licenseIssueDate = $verification->license_issue_date->format('Y-m-d');
            }

            if ($verification->license_expiry_date instanceof \Carbon\Carbon) {
                $licenseExpiryDate = $verification->license_expiry_date->format('Y-m-d');
            }

            return array_merge($verification->toArray(), [
                'license_issue_date'  => $licenseIssueDate,
                'license_expiry_date' => $licenseExpiryDate,
            ]);
        });

        return Inertia::render('admin/verifications/index', [
            'verifications' => $verifications,
            'filters'       => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Display the specified verification.
     */
    public function show(UserVerification $verification): Response
    {
        $verification->load([
            'user:id,name,email,avatar,phone,date_of_birth',
            'verifier:id,name',
            'rejector:id,name'
        ]);

        // Format dates
        $licenseIssueDate  = null;
        $licenseExpiryDate = null;
        $userDateOfBirth   = null;

        if ($verification->license_issue_date instanceof \Carbon\Carbon) {
            $licenseIssueDate = $verification->license_issue_date->format('Y-m-d');
        }

        if ($verification->license_expiry_date instanceof \Carbon\Carbon) {
            $licenseExpiryDate = $verification->license_expiry_date->format('Y-m-d');
        }

        if ($verification->user->date_of_birth instanceof \Carbon\Carbon) {
            $userDateOfBirth = $verification->user->date_of_birth->format('Y-m-d');
        }

        $verificationData = array_merge($verification->toArray(), [
            'license_issue_date'  => $licenseIssueDate,
            'license_expiry_date' => $licenseExpiryDate,
            'user'                => array_merge($verification->user->toArray(), [
                'date_of_birth' => $userDateOfBirth,
            ]),
        ]);

        return Inertia::render('admin/verifications/show', [
            'verification' => $verificationData,
        ]);
    }

    /**
     * Approve a verification.
     */
    public function approve(UserVerification $verification): RedirectResponse
    {
        try {
            if ($verification->status === 'verified') {
                return back()->with('error', 'This verification is already approved.');
            }

            /** @var \App\Models\User */
            $admin = Auth::user();

            $verification->update([
                'status'          => 'verified',
                'verified_by'     => $admin->id,
                'verified_at'     => now(),
                'rejected_by'     => null,
                'rejected_at'     => null,
                'rejected_reason' => null,
            ]);

            return back()->with('success', 'Verification approved successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to approve verification. Please try again.');
        }
    }

    /**
     * Reject a verification.
     */
    public function reject(Request $request, UserVerification $verification): RedirectResponse
    {
        try {
            $request->validate([
                'reason' => ['required', 'string', 'max:1000'],
            ]);

            if ($verification->status === 'rejected') {
                return back()->with('error', 'This verification is already rejected.');
            }

            /** @var \App\Models\User */
            $admin = Auth::user();

            $verification->update([
                'status'          => 'rejected',
                'rejected_by'     => $admin->id,
                'rejected_at'     => now(),
                'rejected_reason' => $request->reason,
                'verified_by'     => null,
                'verified_at'     => null,
            ]);

            return back()->with('success', 'Verification rejected successfully.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to reject verification. Please try again.');
        }
    }
}
