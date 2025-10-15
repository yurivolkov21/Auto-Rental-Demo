<?php

return [
    /*
    |--------------------------------------------------------------------------
    | PayPal Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for PayPal payment integration
    |
    */

    'mode' => env('PAYPAL_MODE', 'sandbox'), // 'sandbox' or 'live'

    'sandbox' => [
        'client_id'     => env('PAYPAL_SANDBOX_CLIENT_ID', ''),
        'client_secret' => env('PAYPAL_SANDBOX_CLIENT_SECRET', ''),
    ],

    'live' => [
        'client_id'     => env('PAYPAL_LIVE_CLIENT_ID', ''),
        'client_secret' => env('PAYPAL_LIVE_CLIENT_SECRET', ''),
    ],

    'currency' => env('PAYPAL_CURRENCY', 'USD'), // Default currency

    'return_url'  => env('APP_URL') . '/payment/paypal/success',
    'cancel_url'  => env('APP_URL') . '/payment/paypal/cancel',
    'webhook_url' => env('APP_URL') . '/webhook/paypal',
];
