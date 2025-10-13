<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\UserUpdateRequest;

class UserController extends Controller
{
    /**
     * Display a listing of users with filters and statistics.
     */
    public function index(Request $request): Response
    {
        $role = $request->get('role', 'all');
        $status = $request->get('status', 'all');
        $verified = $request->get('verified', 'all');
        $search = $request->get('search');

        // Build query
        $query = User::query()
            ->with('verification:id,user_id,status');

        // Apply filters
        if ($role !== 'all') {
            $query->where('role', $role);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($verified === 'yes') {
            $query->whereNotNull('email_verified_at');
        } elseif ($verified === 'no') {
            $query->whereNull('email_verified_at');
        }

        if ($search) {
            $query->search($search);
        }

        // Get users with pagination
        $users = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        // Calculate statistics
        $stats = [
            'total'     => User::count(),
            'customers' => User::where('role', 'customer')->count(),
            'owners'    => User::where('role', 'owner')->count(),
            'admins'    => User::where('role', 'admin')->count(),
            'verified'  => User::whereNotNull('email_verified_at')->count(),
            'active'    => User::where('status', 'active')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users'   => $users,
            'stats'   => $stats,
            'filters' => [
                'role'     => $role,
                'status'   => $status,
                'verified' => $verified,
                'search'   => $search,
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['verification', 'statusChanger:id,name,email']);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        // Format date_of_birth for HTML date input (YYYY-MM-DD)
        $userData = $user->toArray();
        if ($user->date_of_birth) {
            $userData['date_of_birth'] = $user->date_of_birth instanceof \Carbon\Carbon
                ? $user->date_of_birth->format('Y-m-d')
                : date('Y-m-d', strtotime($user->date_of_birth));
        }

        return Inertia::render('admin/users/edit', [
            'user' => $userData,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserUpdateRequest $request, User $user): RedirectResponse
    {
        try {
            $validated = $request->validated();

            // Update the user
            $user->update($validated);

            return redirect()
                ->route('admin.users.show', $user)
                ->with('success', "User '{$user->name}' has been updated successfully.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update user: ' . $e->getMessage());
        }
    }

    /**
     * Change the user's status (activate, suspend, ban).
     */
    public function changeStatus(Request $request, User $user): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'status' => ['required', 'in:active,inactive,suspended,banned'],
                'note'   => ['required_if:status,suspended,banned', 'nullable', 'string', 'max:500'],
            ]);

            // Prevent changing own status
            if ($user->id === Auth::id()) {
                return redirect()
                    ->back()
                    ->with('error', 'You cannot change your own status.');
            }

            // Update status with tracking
            $user->update([
                'status'               => $validated['status'],
                'status_note'          => $validated['note'] ?? null,
                'status_changed_at'    => now(),
                'status_changed_by_id' => Auth::id(),
            ]);

            return redirect()
                ->back()
                ->with('success', "User status has been changed to '{$validated['status']}'.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to change user status: ' . $e->getMessage());
        }
    }

    /**
     * Change the user's role (promote/demote).
     */
    public function changeRole(Request $request, User $user): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'role' => ['required', 'in:customer,owner,driver,admin'],
            ]);

            // Prevent changing own role
            if ($user->id === Auth::id()) {
                return redirect()
                    ->back()
                    ->with('error', 'You cannot change your own role.');
            }

            // Prevent removing last admin
            if ($user->isAdmin() && $validated['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1) {
                return redirect()
                    ->back()
                    ->with('error', 'Cannot change the role of the last admin.');
            }

            $oldRole = $user->role;
            $newRole = $validated['role'];

            // Update role
            $user->update([
                'role' => $newRole,
            ]);

            // Auto-manage DriverProfile based on role changes
            if ($newRole === 'driver' && $oldRole !== 'driver') {
                // Case 1: Promoting to driver role
                $existingProfile = $user->driverProfile;

                if ($existingProfile) {
                    // Reactivate existing profile (preserves rating, trips, etc.)
                    $existingProfile->update([
                        'status'                   => 'off_duty',
                        'is_available_for_booking' => false,
                    ]);
                } else {
                    // Create new profile with default values
                    $user->driverProfile()->create([
                        'status'                   => 'off_duty',
                        'is_available_for_booking' => false,
                        'hourly_fee'               => 0.00,
                        'daily_fee'                => 0.00,
                        'overtime_fee_per_hour'    => 0.00,
                        'daily_hour_threshold'     => 10,
                        'completed_trips'          => 0,
                        'total_km_driven'          => 0,
                        'total_hours_driven'       => 0,
                    ]);
                }
            } elseif ($oldRole === 'driver' && $newRole !== 'driver') {
                // Case 2: Demoting from driver role - Deactivate but preserve data
                $driverProfile = $user->driverProfile;

                if ($driverProfile) {
                    $driverProfile->update([
                        'status'                   => 'off_duty',
                        'is_available_for_booking' => false,
                    ]);
                }
            }

            return redirect()
                ->back()
                ->with('success', "User role has been changed to '{$newRole}'.");
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to change user role: ' . $e->getMessage());
        }
    }

    /**
     * Reset the user's password (admin-initiated).
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            // Hash and update password
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            // Invalidate all sessions (future: implement session management)
            // $user->sessions()->delete();

            // Send notification email (future)
            // $user->notify(new PasswordResetByAdminNotification());

            return redirect()
                ->back()
                ->with('success', 'User password has been reset successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to reset password: ' . $e->getMessage());
        }
    }
}
