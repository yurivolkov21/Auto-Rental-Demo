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

class PayPalService
{
    protected PayPalHttpClient $client;
    protected string $currency;
    protected string $returnUrl;
    protected string $cancelUrl;

    public function __construct()
    {
        $mode = config('paypal.mode');
        $config = config("paypal.{$mode}");

        // Initialize PayPal environment
        $environment = $mode === 'live'
            ? new ProductionEnvironment($config['client_id'], $config['client_secret'])
            : new SandboxEnvironment($config['client_id'], $config['client_secret']);

        $this->client    = new PayPalHttpClient($environment);
        $this->currency  = config('paypal.currency');
        $this->returnUrl = config('paypal.return_url');
        $this->cancelUrl = config('paypal.cancel_url');
    }

    /**
     * Create a PayPal order for a booking
     *
     * @param Booking $booking
     * @param float $amount
     * @param string $paymentType (deposit, full_payment, partial)
     * @return array
     * @throws Exception
     */
    public function createOrder(Booking $booking, float $amount, string $paymentType = 'deposit'): array
    {
        try {
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
                        ]),
                        'amount' => [
                            'currency_code' => $this->currency,
                            'value' => number_format($amount, 2, '.', ''),
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

            // Create payment record
            Payment::create([
                'transaction_id'  => $response->result->id,
                'booking_id'      => $booking->id,
                'user_id'         => $booking->user_id,
                'payment_method'  => 'paypal',
                'payment_type'    => $paymentType,
                'amount'          => $amount,
                'currency'        => $this->currency,
                'status'          => 'pending',
                'paypal_order_id' => $response->result->id,
                'paypal_response' => json_decode(json_encode($response->result), true),
            ]);

            return [
                'success'      => true,
                'order_id'     => $response->result->id,
                'approval_url' => $approvalUrl,
                'status'       => $response->result->status,
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
}
