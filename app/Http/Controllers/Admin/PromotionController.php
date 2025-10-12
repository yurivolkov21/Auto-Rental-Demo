<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Promotion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\Admin\PromotionStoreRequest;
use App\Http\Requests\Admin\PromotionUpdateRequest;

class PromotionController extends Controller
{
    /**
     * Display a listing of promotions.
     */
    public function index(Request $request): Response
    {
        $query = Promotion::query()
            ->with('creator')
            ->orderBy('priority')
            ->orderBy('start_date', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('discount_type', $request->type);
        }

        // Search by code or name
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        $promotions = $query->paginate(15)->withQueryString();

        // Calculate statistics
        $stats = [
            'total'      => Promotion::count(),
            'active'     => Promotion::where('status', 'active')->count(),
            'featured'   => Promotion::where('is_featured', true)->count(),
            'total_uses' => Promotion::sum('used_count'),
        ];

        return Inertia::render('admin/promotions/index', [
            'promotions' => $promotions,
            'stats'      => $stats,
            'filters'    => [
                'status' => $request->status ?? 'all',
                'type'   => $request->type ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show the form for creating a new promotion.
     */
    public function create(): Response
    {
        return Inertia::render('admin/promotions/form', [
            'promotion' => null,
            'isEditing' => false,
        ]);
    }

    /**
     * Store a newly created promotion.
     */
    public function store(PromotionStoreRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $data['created_by'] = Auth::id();

            Promotion::create($data);

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion created successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to create promotion. Please try again.');
        }
    }

    /**
     * Display the specified promotion.
     */
    public function show(Promotion $promotion): Response
    {
        $promotion->load('creator');

        return Inertia::render('admin/promotions/show', [
            'promotion' => $promotion,
        ]);
    }

    /**
     * Show the form for editing the specified promotion.
     */
    public function edit(Promotion $promotion): Response
    {
        return Inertia::render('admin/promotions/form', [
            'promotion' => $promotion,
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified promotion.
     */
    public function update(PromotionUpdateRequest $request, Promotion $promotion): RedirectResponse
    {
        try {
            $data = $request->validated();
            $promotion->update($data);

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion updated successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withInput()
                ->with('error', 'Failed to update promotion. Please try again.');
        }
    }

    /**
     * Remove the specified promotion.
     */
    public function destroy(Promotion $promotion): RedirectResponse
    {
        try {
            $promotion->delete();

            return redirect()
                ->route('admin.promotions.index')
                ->with('success', 'Promotion deleted successfully.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to delete promotion. Please try again.');
        }
    }

    /**
     * Toggle promotion status.
     */
    public function toggleStatus(Promotion $promotion): RedirectResponse
    {
        try {
            $newStatus = $promotion->status === 'active' ? 'paused' : 'active';
            $promotion->update(['status' => $newStatus]);

            $message = $newStatus === 'active'
                ? 'Promotion activated successfully.'
                : 'Promotion paused successfully.';

            return redirect()
                ->back()
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Failed to toggle promotion status. Please try again.');
        }
    }
}
