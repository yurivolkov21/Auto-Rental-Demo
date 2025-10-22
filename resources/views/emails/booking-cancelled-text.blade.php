AUTO RENTAL VIETNAM
Premium Car Rental Service
================================

Hi {{ $booking->user->name }},

This email confirms that your booking {{ $booking->booking_code }} has been CANCELLED.

CANCELLED BOOKING: {{ $booking->booking_code }}

--------------------------------
CANCELLATION DETAILS
--------------------------------

Status: Cancelled
Cancelled On: {{ $booking->cancelled_at->format('d M Y, H:i') }}
Reason: {{ $cancellationReason }}

--------------------------------
ORIGINAL BOOKING DETAILS
--------------------------------

Vehicle: {{ $booking->car->brand->name }} {{ $booking->car->name }}
Pickup Date: {{ $booking->pickup_datetime->format('d M Y, H:i') }}
Return Date: {{ $booking->return_datetime->format('d M Y, H:i') }}
Total Amount: {{ number_format($booking->total_amount, 0, '.', '.') }}₫

@if($booking->payments->isNotEmpty())
@php
    $refundedPayment = $booking->payments->first();
@endphp

--------------------------------
REFUND INFORMATION
--------------------------------

@if($refundedPayment->status === 'refunded')
Your refund has been processed successfully.

Refund Amount: {{ number_format($refundedPayment->amount_vnd, 0, '.', '.') }}₫
Refund Method: {{ ucfirst(str_replace('_', ' ', $refundedPayment->payment_method)) }}
Processing Time: 5-10 business days
@else
Your refund is being processed and will be credited to your original payment method within 5-10 business days.
@endif

@endif

--------------------------------
WHAT'S NEXT?
--------------------------------

• Your booking slot has been released and is now available for other customers
• If you paid, the refund will appear in your account within 5-10 business days
• You can make a new booking anytime on our website
• Feel free to contact us if you have any questions

--------------------------------

Browse available cars:
{{ config('app.url') }}/cars

We're sorry to see this booking cancelled. If there's anything we can do to improve your experience or if you'd like to make a new booking, we're here to help.

Best regards,
Auto Rental Vietnam Team

--------------------------------
CONTACT US
--------------------------------
Email: support@autorental.vn
Phone: +84 123 456 789
Website: {{ config('app.url') }}

© {{ date('Y') }} Auto Rental Vietnam. All rights reserved.
