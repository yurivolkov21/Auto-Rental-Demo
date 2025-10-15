<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    protected float $defaultRate;
    protected string $baseCurrency;
    protected string $targetCurrency;

    public function __construct()
    {
        $this->defaultRate = (float) config('app.vnd_to_usd_rate', 24500);
        $this->baseCurrency = config('app.currency', 'VND');
        $this->targetCurrency = config('paypal.currency', 'USD');
    }

    /**
     * Convert VND to USD
     *
     * @param float $amountVND Amount in VND
     * @return float Amount in USD
     */
    public function vndToUsd(float $amountVND): float
    {
        $rate = $this->getExchangeRate();
        return round($amountVND / $rate, 2);
    }

    /**
     * Convert USD to VND
     *
     * @param float $amountUSD Amount in USD
     * @return float Amount in VND
     */
    public function usdToVnd(float $amountUSD): float
    {
        $rate = $this->getExchangeRate();
        return round($amountUSD * $rate, 2);
    }

    /**
     * Get current exchange rate (VND per 1 USD)
     * Cached for 1 hour
     *
     * @return float Exchange rate
     */
    public function getExchangeRate(): float
    {
        // Try to get from cache first (1 hour cache)
        return Cache::remember('exchange_rate_vnd_usd', 3600, function () {
            return $this->fetchExchangeRate();
        });
    }

    /**
     * Fetch exchange rate from API or config
     *
     * @return float Exchange rate
     */
    protected function fetchExchangeRate(): float
    {
        // Option 1: Use fixed rate from config (simple, for MVP)
        if (config('app.use_fixed_exchange_rate', true)) {
            return $this->defaultRate;
        }

        // Option 2: Fetch from API (dynamic, for production)
        try {
            $response = Http::timeout(5)->get('https://api.exchangerate-api.com/v4/latest/USD');

            if ($response->successful()) {
                $data = $response->json();
                $rate = $data['rates']['VND'] ?? $this->defaultRate;

                Log::info('Exchange rate fetched from API', ['rate' => $rate]);

                return $rate;
            }
        } catch (\Exception $e) {
            Log::warning('Failed to fetch exchange rate from API, using default', [
                'error' => $e->getMessage(),
            ]);
        }

        // Fallback to default rate
        return $this->defaultRate;
    }

    /**
     * Format amount with currency symbol
     *
     * @param float $amount
     * @param string $currency
     * @return string
     */
    public function format(float $amount, string $currency = 'VND'): string
    {
        if ($currency === 'VND') {
            return number_format($amount, 0, ',', '.') . ' ₫';
        }

        if ($currency === 'USD') {
            return '$' . number_format($amount, 2, '.', ',');
        }

        return number_format($amount, 2) . ' ' . $currency;
    }

    /**
     * Get conversion details for display
     *
     * @param float $amountVND
     * @return array
     */
    public function getConversionDetails(float $amountVND): array
    {
        $rate = $this->getExchangeRate();
        $amountUSD = $this->vndToUsd($amountVND);

        return [
            'amount_vnd'    => $amountVND,
            'amount_usd'    => $amountUSD,
            'exchange_rate' => $rate,
            'formatted_vnd' => $this->format($amountVND, 'VND'),
            'formatted_usd' => $this->format($amountUSD, 'USD'),
            'rate_text'     => "1 USD = " . number_format($rate, 0) . " VND",
        ];
    }

    /**
     * Refresh exchange rate cache
     *
     * @return float New exchange rate
     */
    public function refreshRate(): float
    {
        Cache::forget('exchange_rate_vnd_usd');
        return $this->getExchangeRate();
    }
}
