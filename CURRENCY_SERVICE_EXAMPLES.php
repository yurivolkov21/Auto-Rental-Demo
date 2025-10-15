<?php

/**
 * Currency Service Usage Examples
 * 
 * This file demonstrates how to use CurrencyService for VND/USD conversion
 */

// Example 1: Basic Conversion
use App\Services\CurrencyService;

$currencyService = app(CurrencyService::class);

// Convert VND to USD
$amountVND = 5000000; // 5 million VND
$amountUSD = $currencyService->vndToUsd($amountVND);
// Result: $204.08 USD (at rate 1 USD = 24,500 VND)

// Convert USD to VND
$amountUSD = 100;
$amountVND = $currencyService->usdToVnd($amountUSD);
// Result: 2,450,000 VND

// ============================================
// Example 2: In PayPal Payment Flow
// ============================================

use App\Models\Booking;
use App\Services\PayPalService;
use App\Services\CurrencyService;

$booking = Booking::find(1);
$currencyService = app(CurrencyService::class);

// Get booking charge in VND (primary currency)
$amountVND = $booking->charge->total_amount; // e.g., 5,000,000 VND

// Get conversion details
$conversion = $currencyService->getConversionDetails($amountVND);

/*
Result:
[
    'amount_vnd' => 5000000.00,
    'amount_usd' => 204.08,
    'exchange_rate' => 24500.00,
    'formatted_vnd' => '5.000.000 ₫',
    'formatted_usd' => '$204.08',
    'rate_text' => '1 USD = 24,500 VND'
]
*/

// Create PayPal payment with USD
$paypalService = app(PayPalService::class);
$paypalOrder = $paypalService->createOrder(
    $booking,
    $conversion['amount_usd'], // Send USD to PayPal
    'deposit'
);

// Store payment with both currencies
Payment::create([
    'transaction_id' => $paypalOrder['order_id'],
    'booking_id' => $booking->id,
    'user_id' => $booking->user_id,
    'payment_method' => 'paypal',
    'payment_type' => 'deposit',
    'amount' => $amountVND,              // Original VND amount
    'currency' => 'VND',                 // Primary currency
    'paypal_order_id' => $paypalOrder['order_id'],
    'notes' => "Paid {$conversion['formatted_usd']} USD via PayPal. Rate: {$conversion['rate_text']}",
]);

// ============================================
// Example 3: In Admin Controller
// ============================================

use App\Http\Controllers\Admin\AdminPaymentController;

class AdminPaymentController extends Controller
{
    protected CurrencyService $currencyService;

    public function __construct(CurrencyService $currencyService)
    {
        $this->currencyService = $currencyService;
    }

    public function index()
    {
        $payments = Payment::with('booking')->paginate(20);

        // Add USD conversion for display
        $payments->getCollection()->transform(function ($payment) {
            if ($payment->currency === 'VND') {
                $payment->amount_usd = $this->currencyService->vndToUsd($payment->amount);
            }
            return $payment;
        });

        return Inertia::render('admin/payments/index', [
            'payments' => $payments,
            'exchange_rate' => $this->currencyService->getExchangeRate(),
        ]);
    }
}

// ============================================
// Example 4: Format Display
// ============================================

$currencyService = app(CurrencyService::class);

// Format VND
echo $currencyService->format(5000000, 'VND');
// Output: 5.000.000 ₫

// Format USD
echo $currencyService->format(204.08, 'USD');
// Output: $204.08

// ============================================
// Example 5: Refresh Exchange Rate
// ============================================

// Manually refresh rate (if using API)
$newRate = $currencyService->refreshRate();
echo "New rate: 1 USD = {$newRate} VND";

// Get current rate
$currentRate = $currencyService->getExchangeRate();

// ============================================
// Example 6: In Blade/Inertia View
// ============================================

// Pass to view
return Inertia::render('payments/show', [
    'booking' => $booking,
    'conversion' => $currencyService->getConversionDetails($booking->charge->total_amount),
]);

// In React component:
/*
<div>
  <p>Amount: {conversion.formatted_vnd}</p>
  <p>PayPal: {conversion.formatted_usd}</p>
  <p className="text-sm text-muted-foreground">
    Exchange rate: {conversion.rate_text}
  </p>
</div>
*/

// ============================================
// Example 7: Testing Different Rates
// ============================================

// Temporarily override rate for testing
config(['app.vnd_to_usd_rate' => 25000]);
$amountUSD = $currencyService->vndToUsd(5000000);
// Result: $200.00 (at rate 1 USD = 25,000 VND)

config(['app.vnd_to_usd_rate' => 24000]);
$amountUSD = $currencyService->vndToUsd(5000000);
// Result: $208.33 (at rate 1 USD = 24,000 VND)
