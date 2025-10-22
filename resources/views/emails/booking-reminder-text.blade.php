AUTO RENTAL VIETNAM
Premium Car Rental Service
================================

Hi {{ $booking->user->name }},

This is a friendly reminder that your car rental booking is coming up soon!

TIME UNTIL PICKUP: {{ $hoursUntilPickup }} hours

YOUR BOOKING REFERENCE: {{ $booking->booking_code }}

--------------------------------
BOOKING DETAILS
--------------------------------

Vehicle: {{ $booking->car->brand->name }} {{ $booking->car->name }}
Category: {{ $booking->car->category->name }}

Pickup Date & Time: {{ $booking->pickup_datetime->format('d M Y, H:i') }} ⚠️
Pickup Location: {{ $booking->pickupLocation->name }}

Return Date & Time: {{ $booking->return_datetime->format('d M Y, H:i') }}
Return Location: {{ $booking->returnLocation->name }}

@if($booking->with_driver && $booking->driver)
Driver Service: Included - {{ $booking->driver->user->name }}
@endif

--------------------------------
PICKUP LOCATION
--------------------------------

{{ $booking->pickupLocation->name }}
{{ $booking->pickupLocation->address }}

--------------------------------
PRE-TRIP CHECKLIST
--------------------------------

Please bring:
☐ Valid driver's license
☐ National ID card or Passport
☐ Booking confirmation (this email)

Arrival:
☐ Arrive 15 minutes early for vehicle inspection
☐ Check your vehicle carefully before departure
☐ Ask any questions about the vehicle features

--------------------------------
NEED HELP?
--------------------------------

24/7 Support Hotline:
Phone: +84 123 456 789
Email: support@autorental.vn

If you're running late or need to make changes, please contact us immediately.

--------------------------------

View booking details:
{{ config('app.url') }}/customer/bookings/{{ $booking->id }}

We're excited to serve you and hope you have a wonderful trip!

Safe travels,
Auto Rental Vietnam Team

--------------------------------
CONTACT US
--------------------------------
Email: support@autorental.vn
Phone: +84 123 456 789
Website: {{ config('app.url') }}

© {{ date('Y') }} Auto Rental Vietnam. All rights reserved.
