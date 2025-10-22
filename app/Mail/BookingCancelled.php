<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingCancelled extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;
    public string $cancellationReason;

    /**
     * Create a new message instance.
     */
    public function __construct(Booking $booking, string $cancellationReason = '')
    {
        $this->booking = $booking->load([
            'user',
            'car.brand',
            'car.category',
            'pickupLocation',
            'returnLocation',
            'payments' => function ($query) {
                $query->where('status', 'refunded')->latest();
            },
        ]);
        $this->cancellationReason = $cancellationReason ?: $booking->cancellation_reason ?? 'No reason provided';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Cancelled - ' . $this->booking->booking_code,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-cancelled',
            text: 'emails.booking-cancelled-text',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
