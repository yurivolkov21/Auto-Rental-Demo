<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all bookings with confirmed or completed status
        $bookings = Booking::whereIn('status', ['confirmed', 'active', 'completed'])
            ->with('charge')
            ->get();

        if ($bookings->isEmpty()) {
            $this->command->info('⚠️  No bookings found. Skipping payment seeding.');
            return;
        }

        $this->command->info('💰 Seeding payments...');

        // Get exchange rate from config
        $exchangeRate = config('app.vnd_to_usd_rate', 24500);

        foreach ($bookings as $booking) {
            // Skip if no charge
            if (!$booking->charge) {
                continue;
            }

            $charge = $booking->charge;

            // Create deposit payment (70% chance of completed)
            if ($charge->deposit_amount > 0) {
                $depositCompleted = fake()->boolean(70);
                $amountVND = $charge->deposit_amount;
                $amountUSD = round($amountVND / $exchangeRate, 2);
                
                Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'payment_method' => fake()->randomElement(['paypal', 'credit_card', 'bank_transfer']),
                    'payment_type' => 'deposit',
                    'amount' => $amountVND, // Legacy
                    'amount_vnd' => $amountVND,
                    'amount_usd' => $amountUSD,
                    'exchange_rate' => $exchangeRate,
                    'currency' => 'VND',
                    'status' => $depositCompleted ? 'completed' : 'pending',
                    'paid_at' => $depositCompleted ? fake()->dateTimeBetween('-1 month', 'now') : null,
                ]);

                // Update charge amount_paid if completed
                if ($depositCompleted) {
                    $charge->increment('amount_paid', $charge->deposit_amount);
                    $charge->update([
                        'balance_due' => $charge->total_amount - $charge->amount_paid - $charge->deposit_amount,
                    ]);
                }
            }

            // For completed bookings, create full payment (50% chance)
            if ($booking->status === 'completed' && fake()->boolean(50)) {
                $remainingAmount = $charge->total_amount - $charge->amount_paid;
                
                if ($remainingAmount > 0) {
                    $fullPaymentCompleted = fake()->boolean(80);
                    $amountVND = $remainingAmount;
                    $amountUSD = round($amountVND / $exchangeRate, 2);
                    
                    Payment::factory()->create([
                        'booking_id' => $booking->id,
                        'user_id' => $booking->user_id,
                        'payment_method' => fake()->randomElement(['paypal', 'credit_card', 'cash']),
                        'payment_type' => 'full_payment',
                        'amount' => $amountVND, // Legacy
                        'amount_vnd' => $amountVND,
                        'amount_usd' => $amountUSD,
                        'exchange_rate' => $exchangeRate,
                        'currency' => 'VND',
                        'status' => $fullPaymentCompleted ? 'completed' : 'pending',
                        'paid_at' => $fullPaymentCompleted ? fake()->dateTimeBetween('-2 weeks', 'now') : null,
                    ]);

                    // Update charge if completed
                    if ($fullPaymentCompleted) {
                        $charge->increment('amount_paid', $remainingAmount);
                        $charge->update([
                            'balance_due' => 0,
                        ]);
                    }
                }
            }

            // Small chance of partial payment (20%)
            if (fake()->boolean(20)) {
                $partialAmountVND = fake()->randomFloat(0, 500000, 2000000); // 500K - 2M VND
                $partialAmountUSD = round($partialAmountVND / $exchangeRate, 2);
                
                Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'payment_method' => fake()->randomElement(['cash', 'bank_transfer']),
                    'payment_type' => 'partial',
                    'amount' => $partialAmountVND, // Legacy
                    'amount_vnd' => $partialAmountVND,
                    'amount_usd' => $partialAmountUSD,
                    'exchange_rate' => $exchangeRate,
                    'currency' => 'VND',
                    'status' => 'completed',
                    'paid_at' => fake()->dateTimeBetween('-1 week', 'now'),
                ]);

                $charge->increment('amount_paid', $partialAmountVND);
                $charge->update([
                    'balance_due' => $charge->total_amount - $charge->amount_paid - $charge->deposit_amount,
                ]);
            }
        }

        $paymentCount = Payment::count();
        $this->command->info("✅ Created {$paymentCount} payments");
        
        // Stats
        $completed = Payment::where('status', 'completed')->count();
        $pending = Payment::where('status', 'pending')->count();
        $totalAmountVND = Payment::where('status', 'completed')->sum('amount_vnd');
        $totalAmountUSD = Payment::where('status', 'completed')->sum('amount_usd');
        
        $this->command->info("   📊 Stats:");
        $this->command->info("      - Completed: {$completed}");
        $this->command->info("      - Pending: {$pending}");
        $this->command->info("      - Total VND: " . number_format($totalAmountVND, 0, ',', '.') . " ₫");
        $this->command->info("      - Total USD: $" . number_format($totalAmountUSD, 2));
    }
}
