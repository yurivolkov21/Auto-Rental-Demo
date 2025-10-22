@extends('emails.layout')

@section('content')
    <h2 class="email-greeting">Hi {{ $booking->user->name }},</h2>
    
    <p class="email-text">
        Great news! Your booking has been <strong>confirmed</strong> and payment has been successfully processed.
    </p>
    
    <p class="email-text">
        Your vehicle is reserved and ready for pickup. Please keep this confirmation email for your records.
    </p>
    
    <!-- Booking Reference Highlight -->
    <div class="highlight-box">
        <p class="highlight-label">Booking Reference</p>
        <p class="highlight-value">{{ $booking->booking_code }}</p>
    </div>
    
    <!-- Booking Details -->
    <div class="info-card">
        <h3 class="info-card-title">📋 Booking Details</h3>
        
        <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value">
                <span class="status-badge status-confirmed">Confirmed</span>
            </span>
        </div>
        
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
            <span class="info-value">{{ $booking->pickup_datetime->format('d M Y, H:i') }}</span>
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
                <span class="info-value">✓ Included</span>
            </div>
        @endif
    </div>
    
    <!-- Payment Details -->
    @if($booking->payments->isNotEmpty())
        @php
            $payment = $booking->payments->first();
        @endphp
        <div class="info-card">
            <h3 class="info-card-title">💳 Payment Details</h3>
            
            <div class="info-row">
                <span class="info-label">Transaction ID</span>
                <span class="info-value">{{ $payment->transaction_id }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Payment Method</span>
                <span class="info-value">{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Amount Paid</span>
                <span class="info-value" style="font-size: 18px; color: #059669; font-weight: 700;">
                    {{ number_format($booking->total_amount, 0, '.', '.') }}₫
                </span>
            </div>
            
            <div class="info-row">
                <span class="info-label">Payment Status</span>
                <span class="info-value">
                    <span class="status-badge status-confirmed">Paid</span>
                </span>
            </div>
        </div>
    @endif
    
    <!-- Important Information -->
    <div class="info-card" style="background-color: #fef3c7; border-color: #fbbf24;">
        <h3 class="info-card-title" style="color: #92400e;">⚠️ Important Information</h3>
        <p style="color: #78350f; font-size: 14px; line-height: 1.7; margin: 0;">
            <strong>What to bring:</strong><br>
            • Valid driver's license<br>
            • National ID card or Passport<br>
            • This confirmation email (printed or digital)<br>
            <br>
            <strong>Arrival time:</strong><br>
            Please arrive 15 minutes before your scheduled pickup time for vehicle inspection and paperwork.
        </p>
    </div>
    
    <!-- CTA Button -->
    <div class="button-container">
        <a href="{{ config('app.url') }}/customer/bookings/{{ $booking->id }}" class="email-button">
            View Full Booking Details
        </a>
    </div>
    
    <p class="email-text">
        If you have any questions or need to make changes to your booking, please don't hesitate to contact us.
    </p>
    
    <p class="email-text">
        Thank you for choosing Auto Rental Vietnam. We look forward to serving you!
    </p>
    
    <p class="email-text" style="margin-top: 30px;">
        Best regards,<br>
        <strong>Auto Rental Vietnam Team</strong>
    </p>
@endsection
