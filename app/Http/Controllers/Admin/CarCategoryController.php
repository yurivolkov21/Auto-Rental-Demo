<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\CarCategory;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\CarCategoryStoreRequest;
use App\Http\Requests\Admin\CarCategoryUpdateRequest;

class CarCategoryController extends Controller
{
    /**
     * Display a listing of car categories.
     */
    public function index(Request $request): Response
    {
        $query = CarCategory::query()->withCount('cars');

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

        $categories = $query->paginate(20)->withQueryString();

        // Get statistics
        $stats = [
            'total'    => CarCategory::count(),
            'active'   => CarCategory::where('is_active', true)->count(),
            'inactive' => CarCategory::where('is_active', false)->count(),
        ];

        return Inertia::render('admin/car-categories/index', [
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new car category.
     */
    public function create(): Response
    {
        return Inertia::render('admin/car-categories/create');
    }

    /**
     * Store a newly created car category in storage.
     */
    public function store(CarCategoryStoreRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Generate slug from name if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique
            $originalSlug = $data['slug'];
            $counter      = 1;
            while (CarCategory::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            // Set defaults
            $data['icon']       = $data['icon'] ?? 'car';
            $data['is_active']  = $data['is_active'] ?? true;
            $data['sort_order'] = $data['sort_order'] ?? 0;

            CarCategory::create($data);

            return redirect()
                ->route('admin.car-categories.index')
                ->with('success', 'Car category created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create car category. Please try again.');
        }
    }

    /**
     * Display the specified car category.
     */
    public function show(CarCategory $carCategory): Response
    {
        $carCategory->loadCount('cars');

        return Inertia::render('admin/car-categories/show', [
            'category' => $carCategory,
        ]);
    }

    /**
     * Show the form for editing the specified car category.
     */
    public function edit(CarCategory $carCategory): Response
    {
        return Inertia::render('admin/car-categories/edit', [
            'category' => $carCategory,
        ]);
    }

    /**
     * Update the specified car category in storage.
     */
    public function update(CarCategoryUpdateRequest $request, CarCategory $carCategory): RedirectResponse
    {
        try {
            $data = $request->validated();

            // Generate slug from name if not provided
            if (!isset($data['slug']) || empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            // Ensure slug is unique (except for current category)
            $originalSlug = $data['slug'];
            $counter      = 1;
            while (CarCategory::where('slug', $data['slug'])->where('id', '!=', $carCategory->id)->exists()) {
                $data['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }

            $carCategory->update($data);

            return redirect()
                ->route('admin.car-categories.index')
                ->with('success', 'Car category updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update car category. Please try again.');
        }
    }

    /**
     * Toggle car category active status.
     */
    public function toggleStatus(CarCategory $carCategory): RedirectResponse
    {
        try {
            $carCategory->update([
                'is_active' => !$carCategory->is_active,
            ]);

            $status = $carCategory->is_active ? 'activated' : 'deactivated';

            return back()->with('success', "Car category {$status} successfully.");
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to toggle category status. Please try again.');
        }
    }
}
