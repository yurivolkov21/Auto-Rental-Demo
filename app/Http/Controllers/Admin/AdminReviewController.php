<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    /**
     * Display a listing of reviews.
     */
    public function index(Request $request): Response
    {
        $query = Review::query()
            ->with(['user', 'car.brand', 'booking', 'responder']);

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by rating
        if ($request->filled('rating') && $request->rating !== 'all') {
            $query->where('rating', $request->rating);
        }

        // Filter by verified booking
        if ($request->filled('verified') && $request->verified !== 'all') {
            $verified = $request->verified === 'yes';
            $query->where('is_verified_booking', $verified);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('car', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('model', 'like', "%{$search}%");
                    })
                    ->orWhereHas('booking', function ($q) use ($search) {
                        $q->where('booking_code', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $reviews = $query->paginate(20)->withQueryString();

        // Calculate statistics
        $stats = [
            'total' => Review::count(),
            'approved' => Review::where('status', 'approved')->count(),
            'pending' => Review::where('status', 'pending')->count(),
            'rejected' => Review::where('status', 'rejected')->count(),
            'average_rating' => number_format(Review::where('status', 'approved')->avg('rating') ?? 0, 2),
            'by_rating' => [
                '5' => Review::where('status', 'approved')->where('rating', 5)->count(),
                '4' => Review::where('status', 'approved')->where('rating', 4)->count(),
                '3' => Review::where('status', 'approved')->where('rating', 3)->count(),
                '2' => Review::where('status', 'approved')->where('rating', 2)->count(),
                '1' => Review::where('status', 'approved')->where('rating', 1)->count(),
            ],
        ];

        return Inertia::render('admin/reviews/index', [
            'reviews' => $reviews,
            'stats' => $stats,
            'filters' => [
                'status' => $request->get('status', 'all'),
                'rating' => $request->get('rating', 'all'),
                'verified' => $request->get('verified', 'all'),
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    /**
     * Display the specified review.
     */
    public function show(Review $review): Response
    {
        $review->load([
            'user',
            'car.brand',
            'car.category',
            'car.owner',
            'booking.charge',
            'responder',
        ]);

        return Inertia::render('admin/reviews/show', [
            'review' => $review,
        ]);
    }

    /**
     * Approve a review.
     */
    public function approve(Request $request, Review $review)
    {
        $review->approve();

        return back()->with('success', 'Review approved successfully.');
    }

    /**
     * Reject a review.
     */
    public function reject(Request $request, Review $review)
    {
        $review->reject();

        return back()->with('success', 'Review rejected successfully.');
    }

    /**
     * Add response to a review.
     */
    public function respond(Request $request, Review $review)
    {
        $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->addResponse($request->response, $request->user()->id);

        return back()->with('success', 'Response added successfully.');
    }

    /**
     * Delete a review.
     */
    public function destroy(Review $review)
    {
        $review->delete();

        return redirect()
            ->route('admin.reviews.index')
            ->with('success', 'Review deleted successfully.');
    }
}
