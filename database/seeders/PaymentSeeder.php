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

        foreach ($bookings as $booking) {
            // Skip if no charge
            if (!$booking->charge) {
                continue;
            }

            $charge = $booking->charge;

            // Create deposit payment (70% chance of completed)
            if ($charge->deposit_amount > 0) {
                $depositCompleted = fake()->boolean(70);
                
                Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'payment_method' => fake()->randomElement(['paypal', 'credit_card', 'bank_transfer']),
                    'payment_type' => 'deposit',
                    'amount' => $charge->deposit_amount,
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
                    
                    Payment::factory()->create([
                        'booking_id' => $booking->id,
                        'user_id' => $booking->user_id,
                        'payment_method' => fake()->randomElement(['paypal', 'credit_card', 'cash']),
                        'payment_type' => 'full_payment',
                        'amount' => $remainingAmount,
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
                $partialAmount = fake()->randomFloat(2, 20, 100);
                
                Payment::factory()->create([
                    'booking_id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'payment_method' => fake()->randomElement(['cash', 'bank_transfer']),
                    'payment_type' => 'partial',
                    'amount' => $partialAmount,
                    'status' => 'completed',
                    'paid_at' => fake()->dateTimeBetween('-1 week', 'now'),
                ]);

                $charge->increment('amount_paid', $partialAmount);
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
        $totalAmount = Payment::where('status', 'completed')->sum('amount');
        
        $this->command->info("   📊 Stats:");
        $this->command->info("      - Completed: {$completed}");
        $this->command->info("      - Pending: {$pending}");
        $this->command->info("      - Total Amount: $" . number_format($totalAmount, 2));
    }
}
