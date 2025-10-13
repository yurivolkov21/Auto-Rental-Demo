<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\DriverProfile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\DriverProfileUpdateRequest;

class DriverProfileController extends Controller
{
    /**
     * Display a listing of all driver profiles.
     */
    public function index(Request $request): Response
    {
        $search    = $request->input('search');
        $status    = $request->input('status');
        $sortBy    = $request->input('sort', 'name');
        $sortOrder = $request->input('order', 'asc');

        $query     = DriverProfile::with(['user', 'owner', 'verification']);

        // Search by driver name or email
        if ($search) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($status && in_array($status, ['available', 'on_duty', 'off_duty', 'suspended'])) {
            $query->where('status', $status);
        }

        // Sorting
        switch ($sortBy) {
            case 'name':
                $query->join('users', 'driver_profiles.user_id', '=', 'users.id')
                      ->orderBy('users.name', $sortOrder)
                      ->select('driver_profiles.*');
                break;
            case 'rating':
                $query->orderBy('average_rating', $sortOrder);
                break;
            case 'trips':
                $query->orderBy('completed_trips', $sortOrder);
                break;
            case 'hourly_fee':
                $query->orderBy('hourly_fee', $sortOrder);
                break;
            case 'daily_fee':
                $query->orderBy('daily_fee', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $drivers = $query->paginate(15)->withQueryString();

        // Statistics
        $stats = [
            'total'     => DriverProfile::count(),
            'available' => DriverProfile::where('status', 'available')->count(),
            'on_duty'   => DriverProfile::where('status', 'on_duty')->count(),
            'suspended' => DriverProfile::where('status', 'suspended')->count(),
        ];

        return Inertia::render('admin/driver-profiles/index', [
            'drivers' => $drivers,
            'stats'   => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort'   => $sortBy,
                'order'  => $sortOrder,
            ],
        ]);
    }

    /**
     * Display the specified driver profile.
     */
    public function show(DriverProfile $driverProfile): Response
    {
        $driverProfile->load(['user', 'owner', 'verification']);

        return Inertia::render('admin/driver-profiles/show', [
            'driver' => $driverProfile,
        ]);
    }

    /**
     * Show the form for editing the specified driver profile.
     */
    public function edit(DriverProfile $driverProfile): Response
    {
        $driverProfile->load(['user', 'owner', 'verification']);

        // Get all car owners for assignment dropdown
        $owners = User::where('role', 'owner')
                      ->select('id', 'name', 'email')
                      ->orderBy('name')
                      ->get();

        return Inertia::render('admin/driver-profiles/edit', [
            'driver' => $driverProfile,
            'owners' => $owners,
        ]);
    }

    /**
     * Update the specified driver profile.
     */
    public function update(DriverProfileUpdateRequest $request, DriverProfile $driverProfile): RedirectResponse
    {
        $driverProfile->update($request->validated());

        return to_route('admin.driver-profiles.show', $driverProfile)
               ->with('success', 'Driver profile updated successfully.');
    }

    /**
     * Update driver status (quick action).
     */
    public function updateStatus(Request $request, DriverProfile $driverProfile): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:available,on_duty,off_duty,suspended'],
        ]);

        $driverProfile->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Driver status updated successfully.');
    }

    /**
     * Toggle driver booking availability (quick action).
     */
    public function toggleAvailability(DriverProfile $driverProfile): RedirectResponse
    {
        $driverProfile->update([
            'is_available_for_booking' => !$driverProfile->is_available_for_booking,
        ]);

        $status = $driverProfile->is_available_for_booking ? 'enabled' : 'disabled';

        return back()->with('success', "Driver booking availability {$status}.");
    }
}
