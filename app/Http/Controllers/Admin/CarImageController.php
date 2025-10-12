<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\CarImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CarImageController extends Controller
{
    /**
     * Upload multiple images for a car
     */
    public function store(Request $request, Car $car)
    {
        $request->validate([
            'images'   => 'required|array|max:10',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        $uploadedImages = [];

        foreach ($request->file('images') as $index => $image) {
            // Store image in storage/app/public/cars/{car_id}/
            $path = $image->store("cars/{$car->id}", 'public');

            // Create database record
            $carImage = CarImage::create([
                'car_id'     => $car->id,
                'image_path' => $path,
                'alt_text'   => $request->input("alt_text.{$index}"),
                'is_primary' => false,
                'sort_order' => CarImage::where('car_id', $car->id)->max('sort_order') + 1,
            ]);

            $uploadedImages[] = $carImage;
        }

        // If this is the first image, make it primary
        if (CarImage::where('car_id', $car->id)->count() === count($uploadedImages)) {
            $uploadedImages[0]->setPrimary();
        }

        return back()->with('success', count($uploadedImages) . ' images uploaded successfully');
    }

    /**
     * Set an image as primary
     */
    public function setPrimary(CarImage $image)
    {
        $image->setPrimary();

        return back()->with('success', 'Primary image updated successfully');
    }

    /**
     * Reorder images for a car
     */
    public function reorder(Request $request, Car $car)
    {
        $request->validate([
            'images'              => 'required|array',
            'images.*.id'         => 'required|exists:car_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->input('images') as $imageData) {
            CarImage::where('id', $imageData['id'])
                ->where('car_id', $car->id)
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return back()->with('success', 'Images reordered successfully');
    }

    /**
     * Delete an image
     */
    public function destroy(CarImage $image)
    {
        $carId      = $image->car_id;
        $wasPrimary = $image->is_primary;

        // Delete physical file
        $image->deleteFile();

        // Delete database record
        $image->delete();

        // If deleted image was primary, set first remaining image as primary
        if ($wasPrimary) {
            $firstImage = CarImage::where('car_id', $carId)
                ->ordered()
                ->first();

            if ($firstImage) {
                $firstImage->setPrimary();
            }
        }

        return back()->with('success', 'Image deleted successfully');
    }
}
