<?php

namespace App\Services;

use Exception;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersGetRequest;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use PayPalCheckoutSdk\Payments\CapturesRefundRequest;

class PayPalService
{
    protected PayPalHttpClient $client;
    protected CurrencyService $currencyService;
    protected string $currency;
    protected string $returnUrl;
    protected string $cancelUrl;

    public function __construct(CurrencyService $currencyService)
    {
        $mode = config('paypal.mode');
        $config = config("paypal.{$mode}");

        // Initialize PayPal environment
        $environment = $mode === 'live'
            ? new ProductionEnvironment($config['client_id'], $config['client_secret'])
            : new SandboxEnvironment($config['client_id'], $config['client_secret']);

        $this->client          = new PayPalHttpClient($environment);
        $this->currencyService = $currencyService;
        $this->currency        = config('paypal.currency');
        $this->returnUrl       = config('paypal.return_url');
        $this->cancelUrl       = config('paypal.cancel_url');
    }

    /**
     * Create a PayPal order for a booking
     *
     * @param Booking $booking
     * @param float $amountVND Amount in VND (will be converted to USD for PayPal)
     * @param string $paymentType (deposit, full_payment, partial)
     * @return array
     * @throws Exception
     */
    public function createOrder(Booking $booking, float $amountVND, string $paymentType = 'deposit'): array
    {
        try {
            // Convert VND to USD for PayPal
            $conversion = $this->currencyService->getConversionDetails($amountVND);
            $amountUSD = $conversion['amount_usd'];
            $exchangeRate = $conversion['exchange_rate'];

            Log::info('Creating PayPal order', [
                'booking_code' => $booking->booking_code,
                'amount_vnd' => $amountVND,
                'amount_usd' => $amountUSD,
                'exchange_rate' => $exchangeRate,
            ]);

            $request = new OrdersCreateRequest();
            $request->prefer('return=representation');

            $request->body = [
                'intent'            => 'CAPTURE',
                'purchase_units'    => [
                    [
                        'reference_id' => $booking->booking_code,
                        'description'  => "Car Rental - {$booking->booking_code}",
                        'custom_id'    => json_encode([
                            'booking_id'   => $booking->id,
                            'payment_type' => $paymentType,
                            'amount_vnd'   => $amountVND,
                            'exchange_rate' => $exchangeRate,
                        ]),
                        'amount' => [
                            'currency_code' => $this->currency,
                            'value' => number_format($amountUSD, 2, '.', ''),
                        ],
                    ],
                ],
                'application_context' => [
                    'brand_name'   => config('app.name'),
                    'landing_page' => 'BILLING',
                    'user_action'  => 'PAY_NOW',
                    'return_url'   => $this->returnUrl,
                    'cancel_url'   => $this->cancelUrl,
                ],
            ];

            $response = $this->client->execute($request);

            // Extract approval URL
            $approvalUrl = null;
            foreach ($response->result->links as $link) {
                if ($link->rel === 'approve') {
                    $approvalUrl = $link->href;
                    break;
                }
            }

            // Create payment record with dual currency
            Payment::create([
                'transaction_id'  => $response->result->id,
                'booking_id'      => $booking->id,
                'user_id'         => $booking->user_id,
                'payment_method'  => 'paypal',
                'payment_type'    => $paymentType,
                'amount'          => $amountVND, // Legacy field
                'amount_vnd'      => $amountVND, // Primary amount
                'amount_usd'      => $amountUSD, // USD amount sent to PayPal
                'exchange_rate'   => $exchangeRate, // Rate at payment time
                'currency'        => 'VND', // Primary currency
                'status'          => 'pending',
                'paypal_order_id' => $response->result->id,
                'paypal_response' => json_decode(json_encode($response->result), true),
                'notes'           => "PayPal payment: {$conversion['formatted_usd']} USD. {$conversion['rate_text']}",
            ]);

            return [
                'success'      => true,
                'order_id'     => $response->result->id,
                'approval_url' => $approvalUrl,
                'status'       => $response->result->status,
                'amount_vnd'   => $amountVND,
                'amount_usd'   => $amountUSD,
                'exchange_rate' => $exchangeRate,
            ];
        } catch (Exception $e) {
            Log::error('PayPal Order Creation Failed', [
                'booking_id' => $booking->id,
                'error'      => $e->getMessage(),
            ]);

            throw new Exception('Failed to create PayPal order: ' . $e->getMessage());
        }
    }

    /**
     * Capture a PayPal order after approval
     *
     * @param string $orderId
     * @return array
     * @throws Exception
     */
    public function captureOrder(string $orderId): array
    {
        try {
            $request  = new OrdersCaptureRequest($orderId);
            $response = $this->client->execute($request);

            // Find payment record
            $payment = Payment::where('paypal_order_id', $orderId)->firstOrFail();

            if ($response->result->status === 'COMPLETED') {
                $payment->update([
                    'status'             => 'completed',
                    'paid_at'            => now(),
                    'paypal_payer_id'    => $response->result->payer->payer_id ?? null,
                    'paypal_payer_email' => $response->result->payer->email_address ?? null,
                    'paypal_response'    => json_decode(json_encode($response->result), true),
                ]);

                // Update booking charge amount_paid
                $bookingCharge = $payment->booking->charge;
                if ($bookingCharge) {
                    $bookingCharge->increment('amount_paid', $payment->amount);
                    $bookingCharge->update([
                        'balance_due' => $bookingCharge->total_amount - $bookingCharge->amount_paid - $bookingCharge->deposit_amount,
                    ]);
                }

                return [
                    'success'        => true,
                    'payment_id'     => $payment->id,
                    'transaction_id' => $orderId,
                    'status'         => 'completed',
                    'amount'         => $payment->amount,
                    'payer_email'    => $payment->paypal_payer_email,
                ];
            }

            $payment->markAsFailed();

            return [
                'success' => false,
                'message' => 'Payment capture failed',
                'status'  => $response->result->status,
            ];
        } catch (Exception $e) {
            Log::error('PayPal Order Capture Failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            throw new Exception('Failed to capture PayPal order: ' . $e->getMessage());
        }
    }

    /**
     * Get order details
     *
     * @param string $orderId
     * @return object
     * @throws Exception
     */
    public function getOrderDetails(string $orderId): object
    {
        try {
            $request  = new OrdersGetRequest($orderId);
            $response = $this->client->execute($request);

            return $response->result;
        } catch (Exception $e) {
            Log::error('PayPal Get Order Failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            throw new Exception('Failed to get PayPal order details: ' . $e->getMessage());
        }
    }

    /**
     * Cancel payment
     *
     * @param string $orderId
     * @return bool
     */
    public function cancelPayment(string $orderId): bool
    {
        try {
            $payment = Payment::where('paypal_order_id', $orderId)->first();

            if ($payment && $payment->isPending()) {
                $payment->update(['status' => 'cancelled']);
                return true;
            }

            return false;
        } catch (Exception $e) {
            Log::error('PayPal Payment Cancellation Failed', [
                'order_id' => $orderId,
                'error'    => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Refund a completed payment
     *
     * @param Payment $payment
     * @param string|null $reason
     * @return array
     * @throws Exception
     */
    public function refundPayment(Payment $payment, ?string $reason = null): array
    {
        try {
            // Validate payment can be refunded
            if (!$payment->isCompleted()) {
                throw new Exception('Only completed payments can be refunded');
            }

            if ($payment->isRefunded()) {
                throw new Exception('Payment has already been refunded');
            }

            // Get capture ID from PayPal response
            $captureId = $this->extractCaptureId($payment);
            
            if (!$captureId) {
                throw new Exception('Capture ID not found in payment record');
            }

            // Create refund request
            $request = new CapturesRefundRequest($captureId);
            $request->prefer('return=representation');
            $request->body = [
                'amount' => [
                    'currency_code' => 'USD',
                    'value' => number_format((float) $payment->amount_usd, 2, '.', ''),
                ],
                'note_to_payer' => $reason ?? 'Refund processed by admin',
            ];

            // Execute refund
            $response = $this->client->execute($request);

            if ($response->result->status === 'COMPLETED') {
                // Update payment record
                $payment->markAsRefunded();
                $payment->update([
                    'notes' => $reason ?? 'Refunded by admin',
                    'paypal_response' => array_merge(
                        $payment->paypal_response ?? [],
                        ['refund' => json_decode(json_encode($response->result), true)]
                    ),
                ]);

                Log::info('PayPal refund successful', [
                    'payment_id' => $payment->id,
                    'capture_id' => $captureId,
                    'refund_id' => $response->result->id,
                ]);

                return [
                    'success' => true,
                    'refund_id' => $response->result->id,
                    'status' => $response->result->status,
                    'amount_vnd' => $payment->amount_vnd,
                    'amount_usd' => $payment->amount_usd,
                ];
            }

            throw new Exception('Refund status: ' . $response->result->status);
        } catch (Exception $e) {
            Log::error('PayPal Refund Failed', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            throw new Exception('Failed to refund PayPal payment: ' . $e->getMessage());
        }
    }

    /**
     * Extract capture ID from PayPal response
     *
     * @param Payment $payment
     * @return string|null
     */
    private function extractCaptureId(Payment $payment): ?string
    {
        $response = $payment->paypal_response;
        
        if (!$response) {
            return null;
        }

        // Check in purchase_units[0].payments.captures[0].id
        if (isset($response['purchase_units'][0]['payments']['captures'][0]['id'])) {
            return $response['purchase_units'][0]['payments']['captures'][0]['id'];
        }

        return null;
    }
}
