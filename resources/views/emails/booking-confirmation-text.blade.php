AUTO RENTAL VIETNAM
Premium Car Rental Service
================================

Hi {{ $booking->user->name }},

Great news! Your booking has been CONFIRMED and payment has been successfully processed.

Your vehicle is reserved and ready for pickup. Please keep this confirmation email for your records.

BOOKING REFERENCE: {{ $booking->booking_code }}

--------------------------------
BOOKING DETAILS
--------------------------------

Status: Confirmed
Vehicle: {{ $booking->car->brand->name }} {{ $booking->car->name }}
Category: {{ $booking->car->category->name }}

Pickup Date & Time: {{ $booking->pickup_datetime->format('d M Y, H:i') }}
Pickup Location: {{ $booking->pickupLocation->name }}

Return Date & Time: {{ $booking->return_datetime->format('d M Y, H:i') }}
Return Location: {{ $booking->returnLocation->name }}

@if($booking->with_driver && $booking->driver)
Driver Service: Included
@endif

@if($booking->payments->isNotEmpty())
@php
    $payment = $booking->payments->first();
@endphp

--------------------------------
PAYMENT DETAILS
--------------------------------

Transaction ID: {{ $payment->transaction_id }}
Payment Method: {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}
Amount Paid: {{ number_format($booking->total_amount, 0, '.', '.') }}₫
Payment Status: Paid

@endif

--------------------------------
IMPORTANT INFORMATION
--------------------------------

What to bring:
• Valid driver's license
• National ID card or Passport
• This confirmation email (printed or digital)

Arrival time:
Please arrive 15 minutes before your scheduled pickup time for vehicle inspection and paperwork.

--------------------------------

View full booking details:
{{ config('app.url') }}/customer/bookings/{{ $booking->id }}

If you have any questions or need to make changes to your booking, please don't hesitate to contact us.

Thank you for choosing Auto Rental Vietnam. We look forward to serving you!

Best regards,
Auto Rental Vietnam Team

--------------------------------
CONTACT US
--------------------------------
Email: support@autorental.vn
Phone: +84 123 456 789
Website: {{ config('app.url') }}

© {{ date('Y') }} Auto Rental Vietnam. All rights reserved.
