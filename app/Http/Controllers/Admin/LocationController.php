<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Location;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\LocationStoreRequest;
use App\Http\Requests\Admin\LocationUpdateRequest;

class LocationController extends Controller
{
    /**
     * Display a listing of locations.
     */
    public function index(Request $request): Response
    {
        $query = Location::query()->orderBy('sort_order')->orderBy('name');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            if ($request->type === 'airport') {
                $query->where('is_airport', true);
            } elseif ($request->type === 'popular') {
                $query->where('is_popular', true);
            } elseif ($request->type === '24_7') {
                $query->where('is_24_7', true);
            }
        }

        // Search by name or address
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $locations = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total'    => Location::count(),
            'active'   => Location::where('is_active', true)->count(),
            'inactive' => Location::where('is_active', false)->count(),
            'airports' => Location::where('is_airport', true)->count(),
            'popular'  => Location::where('is_popular', true)->count(),
            'is_24_7'  => Location::where('is_24_7', true)->count(),
        ];

        return Inertia::render('admin/locations/index', [
            'locations' => $locations,
            'stats'     => $stats,
            'filters'   => [
                'status' => $request->status ?? 'all',
                'type'   => $request->type ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new location.
     */
    public function create(): Response
    {
        return Inertia::render('admin/locations/create');
    }

    /**
     * Store a newly created location in storage.
     */
    public function store(LocationStoreRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Generate slug from name if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique
            $originalSlug = $data['slug'];
            $counter = 1;
            while (Location::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            Location::create($data);

            return redirect()
                ->route('admin.locations.index')
                ->with('success', 'Location created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create location. Please try again.');
        }
    }

    /**
     * Display the specified location.
     */
    public function show(Location $location): Response
    {
        return Inertia::render('admin/locations/show', [
            'location' => $location,
        ]);
    }

    /**
     * Show the form for editing the specified location.
     */
    public function edit(Location $location): Response
    {
        return Inertia::render('admin/locations/edit', [
            'location' => $location,
        ]);
    }

    /**
     * Update the specified location in storage.
     */
    public function update(LocationUpdateRequest $request, Location $location): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Generate slug from name if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique (except for current location)
            $originalSlug = $data['slug'];
            $counter = 1;
            while (Location::where('slug', $data['slug'])->where('id', '!=', $location->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            $location->update($data);

            return redirect()
                ->route('admin.locations.index')
                ->with('success', 'Location updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update location. Please try again.');
        }
    }

    /**
     * Remove the specified location from storage.
     */
    public function destroy(Location $location): RedirectResponse
    {
        try {
            $location->delete();

            return redirect()
                ->route('admin.locations.index')
                ->with('success', 'Location deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete location. It may be in use.');
        }
    }

    /**
     * Toggle location active status.
     */
    public function toggleStatus(Location $location): RedirectResponse
    {
        try {
            $location->update([
                'is_active' => !$location->is_active,
            ]);

            $status = $location->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "Location {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to toggle location status. Please try again.');
        }
    }
}
