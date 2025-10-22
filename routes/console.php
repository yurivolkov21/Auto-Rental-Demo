<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule exchange rate refresh every hour (if using dynamic API)
Schedule::command('currency:refresh')
    ->hourly()
    ->when(fn () => !config('app.use_fixed_exchange_rate', true))
    ->onSuccess(fn () => Log::info('Exchange rate refreshed successfully'))
    ->onFailure(fn () => Log::error('Failed to refresh exchange rate'));

// Schedule booking reminders (24 hours before pickup)
Schedule::command('bookings:send-reminders')
    ->hourly()
    ->onSuccess(fn () => Log::info('Booking reminders sent successfully'))
    ->onFailure(fn () => Log::error('Failed to send booking reminders'));
