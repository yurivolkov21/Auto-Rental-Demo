<?php

namespace App\Http\Controllers;

use App\Models\Car;
use App\Models\CarCategory;
use App\Models\CarBrand;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CarController extends Controller
{
    /**
     * Display car listing with filters
     */
    public function index(Request $request): Response
    {
        $query = Car::with(['category', 'brand', 'location', 'images'])
            ->where('status', 'available')
            ->where('is_verified', true);

        // Filter by category
        if ($request->filled('category')) {
            $categories = is_array($request->category)
                ? $request->category
                : explode(',', $request->category);
            $query->whereIn('category_id', $categories);
        }

        // Filter by brand
        if ($request->filled('brand')) {
            $brands = is_array($request->brand)
                ? $request->brand
                : explode(',', $request->brand);
            $query->whereIn('brand_id', $brands);
        }

        // Filter by price range
        if ($request->filled('price_min')) {
            $query->where('daily_rate', '>=', $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('daily_rate', '<=', $request->price_max);
        }

        // Filter by seats
        if ($request->filled('seats')) {
            $query->where('seats', '>=', $request->seats);
        }

        // Filter by transmission
        if ($request->filled('transmission')) {
            $query->where('transmission', $request->transmission);
        }

        // Filter by fuel type
        if ($request->filled('fuel_type')) {
            $fuelTypes = is_array($request->fuel_type)
                ? $request->fuel_type
                : explode(',', $request->fuel_type);
            $query->whereIn('fuel_type', $fuelTypes);
        }

        // Search by name/model
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        switch ($sortBy) {
            case 'price':
                $query->orderBy('daily_rate', $sortDirection);
                break;
            case 'rating':
                $query->orderBy('average_rating', $sortDirection);
                break;
            case 'popularity':
                $query->orderBy('rental_count', $sortDirection);
                break;
            default:
                $query->orderBy('created_at', $sortDirection);
                break;
        }

        // Paginate results
        $perPage = $request->get('per_page', 12);
        $cars = $query->paginate($perPage)->withQueryString();

        // Transform cars data
        $cars->getCollection()->transform(function ($car) {
            return [
                'id' => $car->id,
                'name' => $car->name,
                'model' => $car->model,
                'slug' => $car->id, // We'll use ID as slug for now
                'price_per_day' => floatval($car->daily_rate),
                'daily_rate' => $car->daily_rate,
                'hourly_rate' => $car->hourly_rate,
                'primary_image' => $car->primary_image,
                'average_rating' => $car->average_rating ? floatval($car->average_rating) : 0,
                'reviews_count' => $car->reviews_count ?? 0,
                'seats' => $car->seats,
                'transmission' => $car->transmission,
                'fuel_type' => $car->fuel_type,
                'is_featured' => false, // Add logic if needed
                // New fields for enhanced display
                'year' => $car->year,
                'color' => $car->color,
                'odometer_km' => $car->odometer_km,
                'is_delivery_available' => $car->is_delivery_available,
                'delivery_fee_per_km' => $car->delivery_fee_per_km,
                'rental_count' => $car->rental_count,
                'features' => $car->features,
                'category' => [
                    'id' => $car->category->id,
                    'name' => $car->category->name,
                ],
                'brand' => [
                    'id' => $car->brand->id,
                    'name' => $car->brand->name,
                ],
            ];
        });

        // Get all categories and brands for filters
        $categories = CarCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $brands = CarBrand::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // Get price range
        $priceRange = [
            'min' => Car::where('status', 'available')->min('daily_rate') ?? 0,
            'max' => Car::where('status', 'available')->max('daily_rate') ?? 1000,
        ];

        return Inertia::render('customer/cars/index', [
            'cars' => $cars,
            'categories' => $categories,
            'brands' => $brands,
            'priceRange' => $priceRange,
            'filters' => [
                'category' => $request->category,
                'brand' => $request->brand,
                'price_min' => $request->price_min,
                'price_max' => $request->price_max,
                'seats' => $request->seats,
                'transmission' => $request->transmission,
                'fuel_type' => $request->fuel_type,
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display single car detail
     */
    public function show(Request $request, int $id): Response
    {
        $car = Car::with([
            'category',
            'brand',
            'location',
            'images',
            'reviews' => function ($query) {
                $query->with('user')
                    ->where('status', 'approved')
                    ->latest()
                    ->limit(10);
            }
        ])
            ->where('status', 'available')
            ->where('is_verified', true)
            ->findOrFail($id);

        // Get related cars (same category)
        $relatedCars = Car::with(['category', 'brand', 'images'])
            ->where('category_id', $car->category_id)
            ->where('id', '!=', $car->id)
            ->where('status', 'available')
            ->where('is_verified', true)
            ->limit(4)
            ->get()
            ->map(function ($relatedCar) {
                return [
                    'id' => $relatedCar->id,
                    'name' => $relatedCar->name,
                    'slug' => $relatedCar->id,
                    'price_per_day' => floatval($relatedCar->daily_rate),
                    'daily_rate' => $relatedCar->daily_rate,
                    'hourly_rate' => $relatedCar->hourly_rate,
                    'primary_image' => $relatedCar->primary_image,
                    'average_rating' => $relatedCar->average_rating ? floatval($relatedCar->average_rating) : 0,
                    'reviews_count' => $relatedCar->reviews_count ?? 0,
                    'seats' => $relatedCar->seats,
                    'transmission' => $relatedCar->transmission,
                    'fuel_type' => $relatedCar->fuel_type,
                    // Add new fields for CarCard display
                    'year' => $relatedCar->year,
                    'color' => $relatedCar->color,
                    'odometer_km' => $relatedCar->odometer_km,
                    'is_delivery_available' => $relatedCar->is_delivery_available,
                    'delivery_fee_per_km' => $relatedCar->delivery_fee_per_km,
                    'rental_count' => $relatedCar->rental_count,
                    'features' => $relatedCar->features,
                    'category' => [
                        'id' => $relatedCar->category->id,
                        'name' => $relatedCar->category->name,
                    ],
                    'brand' => [
                        'id' => $relatedCar->brand->id,
                        'name' => $relatedCar->brand->name,
                    ],
                ];
            });

        // Get available locations
        $locations = Location::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'address']);

        // Transform car data
        $carData = [
            'id' => $car->id,
            'name' => $car->name,
            'model' => $car->model,
            'color' => $car->color,
            'year' => $car->year,
            'seats' => $car->seats,
            'transmission' => $car->transmission,
            'fuel_type' => $car->fuel_type,
            'odometer_km' => $car->odometer_km,
            'description' => $car->description,
            'features' => $car->features,
            'daily_rate' => $car->daily_rate,
            'hourly_rate' => $car->hourly_rate,
            'deposit_amount' => $car->deposit_amount,
            'is_delivery_available' => $car->is_delivery_available,
            'delivery_fee_per_km' => $car->delivery_fee_per_km,
            // Add missing pricing/delivery fields
            'overtime_fee_per_hour' => $car->overtime_fee_per_hour,
            'min_rental_hours' => $car->min_rental_hours,
            'daily_hour_threshold' => $car->daily_hour_threshold,
            'max_delivery_distance' => $car->max_delivery_distance,
            // Performance metrics
            'primary_image' => $car->primary_image,
            'average_rating' => $car->average_rating ? floatval($car->average_rating) : 0,
            'reviews_count' => $car->reviews_count ?? 0,
            'rental_count' => $car->rental_count,
            'category' => [
                'id' => $car->category->id,
                'name' => $car->category->name,
            ],
            'brand' => [
                'id' => $car->brand->id,
                'name' => $car->brand->name,
            ],
            'location' => [
                'id' => $car->location->id,
                'name' => $car->location->name,
                'address' => $car->location->address,
            ],
            'images' => $car->images->map(fn($img) => [
                'id' => $img->id,
                'image_url' => $img->image_url,
                'is_primary' => $img->is_primary,
                'display_order' => $img->display_order ?? 0,
            ]),
            'reviews' => $car->reviews->map(fn($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at->format('M d, Y'),
                'user' => [
                    'name' => $review->user->name,
                ],
            ]),
        ];

        return Inertia::render('customer/cars/show', [
            'car' => $carData,
            'relatedCars' => $relatedCars,
            'availableLocations' => $locations,
        ]);
    }
}
