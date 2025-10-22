@extends('emails.layout')

@section('content')
    <h2 class="email-greeting">Hi {{ $booking->user->name }},</h2>
    
    <p class="email-text">
        This is a friendly reminder that your car rental booking is coming up soon!
    </p>
    
    <!-- Time Remaining Highlight -->
    <div class="highlight-box">
        <p class="highlight-label">Time Until Pickup</p>
        <p class="highlight-value">{{ $hoursUntilPickup }} hours</p>
    </div>
    
    <!-- Booking Reference -->
    <div class="info-card" style="background-color: #eff6ff; border-color: #60a5fa;">
        <h3 class="info-card-title" style="color: #1e40af;">📋 Your Booking Reference</h3>
        <p style="font-size: 24px; font-weight: 700; color: #1e3a8a; margin: 10px 0;">
            {{ $booking->booking_code }}
        </p>
    </div>
    
    <!-- Booking Details -->
    <div class="info-card">
        <h3 class="info-card-title">🚗 Booking Details</h3>
        
        <div class="info-row">
            <span class="info-label">Vehicle</span>
            <span class="info-value">{{ $booking->car->brand->name }} {{ $booking->car->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Category</span>
            <span class="info-value">{{ $booking->car->category->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Pickup Date & Time</span>
            <span class="info-value" style="font-weight: 700; color: #dc2626;">
                {{ $booking->pickup_datetime->format('d M Y, H:i') }}
            </span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Pickup Location</span>
            <span class="info-value">{{ $booking->pickupLocation->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Return Date & Time</span>
            <span class="info-value">{{ $booking->return_datetime->format('d M Y, H:i') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Return Location</span>
            <span class="info-value">{{ $booking->returnLocation->name }}</span>
        </div>
        
        @if($booking->with_driver && $booking->driver)
            <div class="info-row">
                <span class="info-label">Driver Service</span>
                <span class="info-value">✓ Included - {{ $booking->driver->user->name }}</span>
            </div>
        @endif
    </div>
    
    <!-- Pickup Location Details -->
    <div class="info-card">
        <h3 class="info-card-title">📍 Pickup Location</h3>
        <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 8px;">
            {{ $booking->pickupLocation->name }}
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            {{ $booking->pickupLocation->address }}
        </p>
    </div>
    
    <!-- Pre-Trip Checklist -->
    <div class="info-card" style="background-color: #fef3c7; border-color: #fbbf24;">
        <h3 class="info-card-title" style="color: #92400e;">✅ Pre-Trip Checklist</h3>
        <p style="color: #78350f; font-size: 14px; line-height: 1.8; margin: 0;">
            <strong>Please bring:</strong><br>
            ☐ Valid driver's license<br>
            ☐ National ID card or Passport<br>
            ☐ Booking confirmation (this email)<br>
            <br>
            <strong>Arrival:</strong><br>
            ☐ Arrive 15 minutes early for vehicle inspection<br>
            ☐ Check your vehicle carefully before departure<br>
            ☐ Ask any questions about the vehicle features
        </p>
    </div>
    
    <!-- Contact Information -->
    <div class="info-card" style="background-color: #f0fdf4; border-color: #86efac;">
        <h3 class="info-card-title" style="color: #166534;">📞 Need Help?</h3>
        <p style="color: #15803d; font-size: 14px; margin: 0;">
            <strong>24/7 Support Hotline:</strong><br>
            Phone: +84 123 456 789<br>
            Email: support@autorental.vn<br>
            <br>
            If you're running late or need to make changes, please contact us immediately.
        </p>
    </div>
    
    <!-- CTA Buttons -->
    <div class="button-container">
        <a href="{{ config('app.url') }}/customer/bookings/{{ $booking->id }}" class="email-button">
            View Booking Details
        </a>
    </div>
    
    <p class="email-text">
        We're excited to serve you and hope you have a wonderful trip!
    </p>
    
    <p class="email-text" style="margin-top: 30px;">
        Safe travels,<br>
        <strong>Auto Rental Vietnam Team</strong>
    </p>
@endsection
