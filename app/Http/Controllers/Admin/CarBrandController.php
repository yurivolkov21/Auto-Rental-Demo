<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\CarBrand;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\CarBrandStoreRequest;
use App\Http\Requests\Admin\CarBrandUpdateRequest;

class CarBrandController extends Controller
{
    /**
     * Display a listing of car brands.
     */
    public function index(Request $request): Response
    {
        $query = CarBrand::query()->withCount('cars');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_active', $request->status === 'active');
        }

        // Search by name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Apply ordering
        $query->ordered();

        $brands = $query->paginate(20)->withQueryString();

        // Get statistics
        $stats = [
            'total'    => CarBrand::count(),
            'active'   => CarBrand::where('is_active', true)->count(),
            'inactive' => CarBrand::where('is_active', false)->count(),
        ];

        return Inertia::render('admin/car-brands/index', [
            'brands'  => $brands,
            'stats'   => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new car brand.
     */
    public function create(): Response
    {
        return Inertia::render('admin/car-brands/create');
    }

    /**
     * Store a newly created car brand in storage.
     */
    public function store(CarBrandStoreRequest $request): RedirectResponse
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
            while (CarBrand::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Set defaults
            $data['is_active']  = $data['is_active'] ?? true;
            $data['sort_order'] = $data['sort_order'] ?? 0;

            CarBrand::create($data);

            return redirect()
                ->route('admin.car-brands.index')
                ->with('success', 'Car brand created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create car brand. Please try again.');
        }
    }

    /**
     * Display the specified car brand.
     */
    public function show(CarBrand $carBrand): Response
    {
        $carBrand->loadCount('cars');

        return Inertia::render('admin/car-brands/show', [
            'brand' => $carBrand,
        ]);
    }

    /**
     * Show the form for editing the specified car brand.
     */
    public function edit(CarBrand $carBrand): Response
    {
        return Inertia::render('admin/car-brands/edit', [
            'brand' => $carBrand,
        ]);
    }

    /**
     * Update the specified car brand in storage.
     */
    public function update(CarBrandUpdateRequest $request, CarBrand $carBrand): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Generate slug from name if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique (except for current brand)
            $originalSlug = $data['slug'];
            $counter = 1;
            while (CarBrand::where('slug', $data['slug'])->where('id', '!=', $carBrand->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            $carBrand->update($data);

            return redirect()
                ->route('admin.car-brands.index')
                ->with('success', 'Car brand updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update car brand. Please try again.');
        }
    }

    /**
     * Toggle car brand active status.
     */
    public function toggleStatus(CarBrand $carBrand): RedirectResponse
    {
        try {
            $carBrand->update([
                'is_active' => !$carBrand->is_active,
            ]);

            $status = $carBrand->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "Car brand {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to toggle brand status. Please try again.');
        }
    }
}
