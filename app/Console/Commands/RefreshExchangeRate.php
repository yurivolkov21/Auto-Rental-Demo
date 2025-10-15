<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use App\Services\CurrencyService;

class RefreshExchangeRate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currency:refresh
                            {--show : Show current rate without refreshing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh exchange rate from API and clear cache';

    /**
     * Execute the console command.
     */
    public function handle(CurrencyService $currencyService): int
    {
        if ($this->option('show')) {
            $this->showCurrentRate($currencyService);
            return self::SUCCESS;
        }

        $this->info('🔄 Refreshing exchange rate...');

        // Clear cache
        $currencyService->refreshRate();

        // Fetch new rate
        $rate = $currencyService->getExchangeRate();

        $this->newLine();
        $this->info('✅ Exchange rate refreshed successfully!');
        $this->line('   📊 Current Rate: 1 USD = ' . number_format($rate, 2) . ' VND');
        
        // Show conversion examples
        $this->newLine();
        $this->line('   💰 Examples:');
        $this->line('      - 1,000,000 VND = $' . number_format($currencyService->vndToUsd(1000000), 2) . ' USD');
        $this->line('      - 5,000,000 VND = $' . number_format($currencyService->vndToUsd(5000000), 2) . ' USD');
        $this->line('      - $100 USD = ' . number_format($currencyService->usdToVnd(100), 0, ',', '.') . ' VND');
        $this->line('      - $500 USD = ' . number_format($currencyService->usdToVnd(500), 0, ',', '.') . ' VND');

        return self::SUCCESS;
    }

    /**
     * Show current cached rate
     */
    private function showCurrentRate(CurrencyService $currencyService): void
    {
        $rate = $currencyService->getExchangeRate();
        $useFixed = config('app.use_fixed_exchange_rate', true);

        $this->info('📊 Current Exchange Rate Configuration:');
        $this->newLine();
        $this->line('   Mode: ' . ($useFixed ? '🔒 Fixed Rate' : '🌐 Dynamic API'));
        $this->line('   Rate: 1 USD = ' . number_format($rate, 2) . ' VND');
        $this->line('   Cache: ' . (Cache::has('exchange_rate_vnd_usd') ? '✅ Cached' : '❌ Not cached'));
        
        if (!$useFixed) {
            $this->newLine();
            $this->line('   💡 Tip: Rate is cached for 1 hour. Use --refresh to update now.');
        }
    }
}
