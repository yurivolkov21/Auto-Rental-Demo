<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use App\Services\PayPalService;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Controller;

class AdminPaymentController extends Controller
{
    /**
     * Display a listing of payments
     */
    public function index(Request $request): Response
    {
        $query = Payment::with(['booking.car', 'booking.user', 'user']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by payment type
        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        // Search by transaction ID or booking code
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                    ->orWhere('paypal_order_id', 'like', "%{$search}%")
                    ->orWhereHas('booking', function ($bookingQuery) use ($search) {
                        $bookingQuery->where('booking_code', 'like', "%{$search}%");
                    });
            });
        }

        // Sort
        $sortBy    = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $payments = $query->paginate(20)->withQueryString();

        // Calculate stats
        $stats = [
            'total_payments'              => Payment::count(),
            'completed'                   => Payment::where('status', 'completed')->count(),
            'pending'                     => Payment::where('status', 'pending')->count(),
            'failed'                      => Payment::where('status', 'failed')->count(),
            'total_amount_completed'      => Payment::where('status', 'completed')->sum('amount'), // Legacy
            'total_amount_pending'        => Payment::where('status', 'pending')->sum('amount'), // Legacy
            'total_amount_completed_vnd'  => Payment::where('status', 'completed')->sum('amount_vnd'),
            'total_amount_completed_usd'  => Payment::where('status', 'completed')->sum('amount_usd'),
            'total_amount_pending_vnd'    => Payment::where('status', 'pending')->sum('amount_vnd'),
            'total_amount_pending_usd'    => Payment::where('status', 'pending')->sum('amount_usd'),
        ];

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'stats'    => $stats,
            'filters'  => $request->only(['status', 'payment_method', 'payment_type', 'search', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Display the specified payment
     */
    public function show(Payment $payment): Response
    {
        $payment->load([
            'booking.car',
            'booking.user',
            'booking.pickupLocation',
            'booking.returnLocation',
            'booking.charge',
            'user',
        ]);

        return Inertia::render('admin/payments/show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Refund a payment through PayPal API
     */
    public function refund(Request $request, Payment $payment, PayPalService $paypalService): RedirectResponse
    {
        if (!$payment->isCompleted()) {
            return back()->with('error', 'Only completed payments can be refunded');
        }

        if ($payment->isRefunded()) {
            return back()->with('error', 'Payment has already been refunded');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            // Only use PayPal API for PayPal payments
            if ($payment->payment_method === 'paypal') {
                $result = $paypalService->refundPayment($payment, $validated['reason'] ?? null);

                if ($result['success']) {
                    // Update booking charge
                    $bookingCharge = $payment->booking->charge;
                    if ($bookingCharge) {
                        $bookingCharge->decrement('amount_paid', $payment->amount_vnd);
                        $bookingCharge->increment('refund_amount', $payment->amount_vnd);
                        $bookingCharge->update([
                            'balance_due' => $bookingCharge->total_amount - $bookingCharge->amount_paid,
                        ]);
                    }

                    return back()->with('success', 'Payment has been refunded successfully via PayPal');
                }
            } else {
                // Manual refund for non-PayPal payments
                $payment->markAsRefunded();
                $payment->update([
                    'notes' => $validated['reason'] ?? 'Refunded by admin (manual)',
                ]);

                // Update booking charge
                $bookingCharge = $payment->booking->charge;
                if ($bookingCharge) {
                    $bookingCharge->decrement('amount_paid', $payment->amount_vnd);
                    $bookingCharge->increment('refund_amount', $payment->amount_vnd);
                    $bookingCharge->update([
                        'balance_due' => $bookingCharge->total_amount - $bookingCharge->amount_paid,
                    ]);
                }

                return back()->with('success', 'Payment has been marked as refunded');
            }
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to refund payment: ' . $e->getMessage());
        }

        return back()->with('error', 'Failed to process refund');
    }

    /**
     * Get payment statistics for dashboard
     */
    public function statistics(): array
    {
        return [
            'today'      => [
                'payments' => Payment::whereDate('created_at', today())->count(),
                'amount'   => Payment::whereDate('created_at', today())->where('status', 'completed')->sum('amount'),
            ],
            'this_week'  => [
                'payments' => Payment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'amount'   => Payment::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->where('status', 'completed')->sum('amount'),
            ],
            'this_month' => [
                'payments' => Payment::whereMonth('created_at', now()->month)->count(),
                'amount'   => Payment::whereMonth('created_at', now()->month)->where('status', 'completed')->sum('amount'),
            ],
            'by_method'  => Payment::where('status', 'completed')
                ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('payment_method')
                ->get(),
            'by_status'  => Payment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
        ];
    }
}
