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

            // Skip if booking is in the future (can't have payments yet)
            if ($booking->created_at > now()) {
                continue;
            }

            $charge = $booking->charge;

            // Create deposit payment (70% chance of completed)
            if ($charge->deposit_amount > 0) {
                $depositCompleted = fake()->boolean(70);
                $amountVND = $charge->deposit_amount;
                $amountUSD = round($amountVND / $exchangeRate, 2);
                
                // Payment date should be after booking creation (within 3 days)
                $maxPaymentDate = (clone $booking->created_at)->modify('+3 days');
                if ($maxPaymentDate > now()) {
                    $maxPaymentDate = now();
                }
                
                // Only generate payment date if max is after created_at
                $paymentDate = null;
                if ($depositCompleted && $maxPaymentDate >= $booking->created_at) {
                    $paymentDate = fake()->dateTimeBetween($booking->created_at, $maxPaymentDate);
                }
                
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
                    'paid_at' => $paymentDate,
                    'created_at' => $booking->created_at,
                    'updated_at' => $paymentDate ?? $booking->created_at,
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
                    
                    // Full payment happens after return (within 7 days)
                    $returnDate = $booking->actual_return_time ?? $booking->return_datetime;
                    
                    // Skip if return date is in the future
                    if ($returnDate > now()) {
                        continue;
                    }
                    
                    $maxPaymentDate = (clone $returnDate)->modify('+7 days');
                    if ($maxPaymentDate > now()) {
                        $maxPaymentDate = now();
                    }
                    
                    $paymentDate = null;
                    if ($fullPaymentCompleted && $maxPaymentDate >= $returnDate) {
                        $paymentDate = fake()->dateTimeBetween($returnDate, $maxPaymentDate);
                    }
                    
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
                        'paid_at' => $paymentDate,
                        'created_at' => $returnDate,
                        'updated_at' => $paymentDate ?? $returnDate,
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
                $partialAmountVND = round(fake()->numberBetween(500, 2000) * 1000); // 500K - 2M VND (rounded to thousands)
                $partialAmountUSD = round($partialAmountVND / $exchangeRate, 2);
                
                // Partial payment happens during rental period
                $maxPartialDate = $booking->actual_return_time ?? $booking->return_datetime;
                if ($maxPartialDate > now()) {
                    $maxPartialDate = now();
                }
                
                // Only create if max date is after booking creation
                if ($maxPartialDate < $booking->created_at) {
                    continue;
                }
                
                $partialPaymentDate = fake()->dateTimeBetween($booking->created_at, $maxPartialDate);
                
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
                    'paid_at' => $partialPaymentDate,
                    'created_at' => $partialPaymentDate,
                    'updated_at' => $partialPaymentDate,
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
