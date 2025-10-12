<?php

namespace App\Http\Controllers\Admin;

use App\Models\Car;
use App\Models\User;
use Inertia\Inertia;
use App\Models\CarBrand;
use App\Models\Location;
use App\Models\CarCategory;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CarController extends Controller
{
    /**
     * Display a listing of cars with filters
     */
    public function index(Request $request)
    {
        $query = Car::with(['owner:id,name,email', 'brand:id,name', 'category:id,name', 'location:id,name', 'primaryImage']);

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category_id', $request->category);
        }

        // Filter by brand
        if ($request->filled('brand') && $request->brand !== 'all') {
            $query->where('brand_id', $request->brand);
        }

        // Filter by verification
        if ($request->filled('verified') && $request->verified !== 'all') {
            $query->where('is_verified', $request->verified === 'verified');
        }

        // Search - searches in: model, license plate, VIN, owner name/email, color
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('model', 'like', "%{$search}%")
                    ->orWhere('license_plate', 'like', "%{$search}%")
                    ->orWhere('vin', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $cars = $query->paginate(20)->withQueryString();

        // Calculate stats
        $stats = [
            'total' => Car::count(),
            'available' => Car::where('status', 'available')->where('is_verified', true)->count(),
            'rented' => Car::where('status', 'rented')->count(),
            'maintenance' => Car::where('status', 'maintenance')->count(),
        ];

        // Get filter options
        $brands = CarBrand::active()->ordered()->get(['id', 'name']);
        $categories = CarCategory::active()->ordered()->get(['id', 'name']);

        return Inertia::render('admin/cars/index', [
            'cars' => $cars,
            'stats' => $stats,
            'brands' => $brands,
            'categories' => $categories,
            'filters' => [
                'status' => $request->get('status', 'all'),
                'category' => $request->get('category', 'all'),
                'brand' => $request->get('brand', 'all'),
                'verified' => $request->get('verified', 'all'),
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    /**
     * Show the form for creating a new car
     */
    public function create()
    {
        $owners = User::where('role', 'owner')->orderBy('name')->get(['id', 'name', 'email']);
        $brands = CarBrand::active()->ordered()->get(['id', 'name']);
        $categories = CarCategory::active()->ordered()->get(['id', 'name']);
        $locations = Location::active()->ordered()->get(['id', 'name']);

        return Inertia::render('admin/cars/create', [
            'owners' => $owners,
            'brands' => $brands,
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    /**
     * Store a newly created car in storage
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:car_categories,id',
            'brand_id' => 'required|exists:car_brands,id',
            'location_id' => 'nullable|exists:locations,id',
            'model' => 'required|string|max:200',
            'year' => 'required|integer|between:2000,2030',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate',
            'vin' => 'nullable|string|max:50|unique:cars,vin',
            'color' => 'nullable|string|max:50',
            'seats' => 'required|integer|between:2,20',
            'transmission' => 'required|in:automatic,manual',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'odometer_km' => 'nullable|integer|min:0',
            'insurance_expiry' => 'nullable|date|after:today',
            'registration_expiry' => 'nullable|date|after:today',
            'last_maintenance_date' => 'nullable|date|before_or_equal:today',
            'next_maintenance_km' => 'nullable|integer|min:0',
            'is_delivery_available' => 'boolean',
            'status' => 'required|in:available,rented,maintenance,inactive',
            'is_verified' => 'boolean',
            'description' => 'nullable|string|max:5000',
            'features' => 'nullable|array',
            'hourly_rate' => 'required|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'daily_hour_threshold' => 'required|integer|between:1,24',
            'deposit_amount' => 'required|numeric|min:0',
            'min_rental_hours' => 'required|integer|min:1',
            'overtime_fee_per_hour' => 'nullable|numeric|min:0',
            'delivery_fee_per_km' => 'nullable|numeric|min:0',
            'max_delivery_distance' => 'nullable|integer|min:1',
        ]);

        $car = Car::create($validated);

        return redirect()->route('admin.cars.show', $car)->with('success', 'Car created successfully');
    }

    /**
     * Display the specified car
     */
    public function show(Car $car)
    {
        $car->load([
            'owner:id,name,email,phone',
            'brand:id,name,logo',
            'category:id,name,icon',
            'location:id,name,address',
            'images' => fn($q) => $q->ordered(),
            'primaryImage',
        ]);

        return Inertia::render('admin/cars/show', [
            'car' => $car,
        ]);
    }

    /**
     * Show the form for editing the specified car
     */
    public function edit(Car $car)
    {
        $car->load(['owner:id,name', 'brand:id,name', 'category:id,name', 'location:id,name']);

        $owners = User::where('role', 'owner')->orderBy('name')->get(['id', 'name', 'email']);
        $brands = CarBrand::active()->ordered()->get(['id', 'name']);
        $categories = CarCategory::active()->ordered()->get(['id', 'name']);
        $locations = Location::active()->ordered()->get(['id', 'name']);

        return Inertia::render('admin/cars/edit', [
            'car' => $car,
            'owners' => $owners,
            'brands' => $brands,
            'categories' => $categories,
            'locations' => $locations,
        ]);
    }

    /**
     * Update the specified car in storage
     */
    public function update(Request $request, Car $car)
    {
        $validated = $request->validate([
            'owner_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:car_categories,id',
            'brand_id' => 'required|exists:car_brands,id',
            'location_id' => 'nullable|exists:locations,id',
            'model' => 'required|string|max:200',
            'year' => 'required|integer|between:2000,2030',
            'license_plate' => 'required|string|max:20|unique:cars,license_plate,' . $car->id,
            'vin' => 'nullable|string|max:50|unique:cars,vin,' . $car->id,
            'color' => 'nullable|string|max:50',
            'seats' => 'required|integer|between:2,20',
            'transmission' => 'required|in:automatic,manual',
            'fuel_type' => 'required|in:petrol,diesel,electric,hybrid',
            'odometer_km' => 'nullable|integer|min:0',
            'insurance_expiry' => 'nullable|date',
            'registration_expiry' => 'nullable|date',
            'last_maintenance_date' => 'nullable|date|before_or_equal:today',
            'next_maintenance_km' => 'nullable|integer|min:0',
            'is_delivery_available' => 'boolean',
            'status' => 'required|in:available,rented,maintenance,inactive',
            'is_verified' => 'boolean',
            'description' => 'nullable|string|max:5000',
            'features' => 'nullable|array',
            'hourly_rate' => 'required|numeric|min:0',
            'daily_rate' => 'required|numeric|min:0',
            'daily_hour_threshold' => 'required|integer|between:1,24',
            'deposit_amount' => 'required|numeric|min:0',
            'min_rental_hours' => 'required|integer|min:1',
            'overtime_fee_per_hour' => 'nullable|numeric|min:0',
            'delivery_fee_per_km' => 'nullable|numeric|min:0',
            'max_delivery_distance' => 'nullable|integer|min:1',
        ]);

        $car->update($validated);

        return redirect()->route('admin.cars.show', $car)->with('success', 'Car updated successfully');
    }

    /**
     * Remove the specified car from storage
     */
    public function destroy(Car $car)
    {
        // TODO: Check for active bookings before deletion
        // if ($car->bookings()->whereIn('status', ['pending', 'confirmed'])->exists()) {
        //     return back()->with('error', 'Cannot delete car with active bookings');
        // }

        $car->delete();

        return redirect()->route('admin.cars.index')->with('success', 'Car deleted successfully');
    }

    /**
     * Toggle car status
     */
    public function toggleStatus(Car $car)
    {
        // Cycle through statuses: available → maintenance → inactive → available
        $statusCycle = [
            'available' => 'maintenance',
            'maintenance' => 'inactive',
            'inactive' => 'available',
            'rented' => 'available', // If somehow rented, make available
        ];

        $newStatus = $statusCycle[$car->status] ?? 'available';
        $car->update(['status' => $newStatus]);

        return back()->with('success', "Car status changed to {$newStatus}");
    }
}
