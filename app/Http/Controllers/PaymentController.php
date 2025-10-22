<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\PayPalService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private PayPalService $paypalService
    ) {}

    /**
     * Handle PayPal success callback
     */
    public function paypalSuccess(Request $request): Response|RedirectResponse
    {
        $orderId = $request->query('token'); // PayPal returns order ID as 'token'

        if (!$orderId) {
            return Inertia::render('customer/payment/error', [
                'message' => 'Missing payment information. Please contact support.',
            ]);
        }

        DB::beginTransaction();
        try {
            // Find payment record
            $payment = Payment::where('paypal_order_id', $orderId)->firstOrFail();
            $booking = $payment->booking;

            // Check if already processed
            if ($payment->isCompleted()) {
                return redirect()->route('booking.confirmation', $booking->id);
            }

            // Capture the PayPal order
            $result = $this->paypalService->captureOrder($orderId);

            if ($result['success']) {
                // Update booking status and payment status
                $booking->update([
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                    'confirmed_at' => now(),
                ]);

                DB::commit();

                Log::info('Payment successful', [
                    'booking_id' => $booking->id,
                    'payment_id' => $payment->id,
                    'order_id' => $orderId,
                ]);

                // TODO: Send confirmation email
                // Mail::to($booking->user->email)->send(new BookingConfirmation($booking));

                return redirect()->route('booking.confirmation', $booking->id)
                    ->with('success', 'Payment completed successfully! Your booking is confirmed.');
            }

            // Payment capture failed
            DB::rollBack();

            $payment->markAsFailed();

            Log::error('Payment capture failed', [
                'booking_id' => $booking->id,
                'order_id' => $orderId,
                'result' => $result,
            ]);

            return Inertia::render('customer/payment/error', [
                'booking' => [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                ],
                'message' => 'Payment capture failed. Please try again or contact support.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment processing error', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return Inertia::render('customer/payment/error', [
                'message' => 'An error occurred while processing your payment. Please contact support.',
                'error_details' => config('app.debug') ? $e->getMessage() : null,
            ]);
        }
    }

    /**
     * Handle PayPal cancel callback
     */
    public function paypalCancel(Request $request): Response|RedirectResponse
    {
        $orderId = $request->query('token');

        if ($orderId) {
            try {
                // Cancel the payment
                $this->paypalService->cancelPayment($orderId);

                // Find payment and booking
                $payment = Payment::where('paypal_order_id', $orderId)->first();

                if ($payment) {
                    $booking = $payment->booking;

                    Log::info('Payment cancelled by user', [
                        'booking_id' => $booking->id,
                        'order_id' => $orderId,
                    ]);

                    return Inertia::render('customer/payment/cancelled', [
                        'booking' => [
                            'id' => $booking->id,
                            'booking_code' => $booking->booking_code,
                            'car_name' => $booking->car->name,
                            'total_amount' => $booking->total_amount,
                        ],
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error handling payment cancellation', [
                    'order_id' => $orderId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return Inertia::render('customer/payment/cancelled', [
            'message' => 'Payment was cancelled. You can try booking again.',
        ]);
    }

    /**
     * Process payment for a booking
     * Called from checkout when user submits with PayPal
     */
    public function processPayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'payment_method' => 'required|in:paypal,credit_card,bank_transfer',
            'payment_type' => 'nullable|in:deposit,full_payment',
        ]);

        try {
            $booking = Booking::with('car')->findOrFail($request->booking_id);

            // Authorization check
            if ($booking->user_id !== Auth::id()) {
                abort(403, 'Unauthorized access to booking');
            }

            // Check if booking already paid
            if ($booking->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking already paid',
                ], 400);
            }

            // Determine payment amount
            $paymentType = $request->payment_type ?? 'full_payment';
            $amount = $paymentType === 'deposit'
                ? (float) $booking->deposit_amount
                : (float) $booking->total_amount;

            if ($request->payment_method === 'paypal') {
                // Create PayPal order
                $result = $this->paypalService->createOrder($booking, $amount, $paymentType);

                if ($result['success']) {
                    return response()->json([
                        'success' => true,
                        'payment_method' => 'paypal',
                        'order_id' => $result['order_id'],
                        'approval_url' => $result['approval_url'],
                        'amount_vnd' => $result['amount_vnd'],
                        'amount_usd' => $result['amount_usd'],
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create PayPal order',
                ], 500);
            }

            // For other payment methods (credit_card, bank_transfer)
            // These would need their own implementations
            return response()->json([
                'success' => false,
                'message' => 'Payment method not yet implemented',
            ], 400);

        } catch (\Exception $e) {
            Log::error('Payment processing failed', [
                'booking_id' => $request->booking_id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show payment status/details
     */
    public function show(int $id): Response
    {
        $payment = Payment::with(['booking.car', 'user'])->findOrFail($id);

        // Authorization check
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('customer/payment/show', [
            'payment' => [
                'id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'payment_method' => $payment->payment_method,
                'payment_type' => $payment->payment_type,
                'amount_vnd' => $payment->amount_vnd,
                'amount_usd' => $payment->amount_usd,
                'exchange_rate' => $payment->exchange_rate,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at?->toISOString(),
                'notes' => $payment->notes,
                'booking' => [
                    'id' => $payment->booking->id,
                    'booking_code' => $payment->booking->booking_code,
                    'car_name' => $payment->booking->car->name,
                ],
            ],
        ]);
    }
}
