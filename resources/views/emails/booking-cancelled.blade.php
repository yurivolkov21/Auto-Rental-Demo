@extends('emails.layout')

@section('content')
    <h2 class="email-greeting">Hi {{ $booking->user->name }},</h2>
    
    <p class="email-text">
        This email confirms that your booking <strong>{{ $booking->booking_code }}</strong> has been cancelled.
    </p>
    
    <!-- Booking Reference Highlight -->
    <div class="highlight-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b;">
        <p class="highlight-label" style="color: #92400e;">Cancelled Booking</p>
        <p class="highlight-value" style="color: #78350f;">{{ $booking->booking_code }}</p>
    </div>
    
    <!-- Cancellation Details -->
    <div class="info-card">
        <h3 class="info-card-title">ℹ️ Cancellation Details</h3>
        
        <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value">
                <span class="status-badge status-cancelled">Cancelled</span>
            </span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Cancelled On</span>
            <span class="info-value">{{ $booking->cancelled_at->format('d M Y, H:i') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Reason</span>
            <span class="info-value">{{ $cancellationReason }}</span>
        </div>
    </div>
    
    <!-- Original Booking Details -->
    <div class="info-card">
        <h3 class="info-card-title">📋 Original Booking Details</h3>
        
        <div class="info-row">
            <span class="info-label">Vehicle</span>
            <span class="info-value">{{ $booking->car->brand->name }} {{ $booking->car->name }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Pickup Date</span>
            <span class="info-value">{{ $booking->pickup_datetime->format('d M Y, H:i') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Return Date</span>
            <span class="info-value">{{ $booking->return_datetime->format('d M Y, H:i') }}</span>
        </div>
        
        <div class="info-row">
            <span class="info-label">Total Amount</span>
            <span class="info-value">{{ number_format($booking->total_amount, 0, '.', '.') }}₫</span>
        </div>
    </div>
    
    <!-- Refund Information -->
    @if($booking->payments->isNotEmpty())
        @php
            $refundedPayment = $booking->payments->first();
        @endphp
        <div class="info-card" style="background-color: #f0fdf4; border-color: #86efac;">
            <h3 class="info-card-title" style="color: #166534;">💰 Refund Information</h3>
            
            @if($refundedPayment->status === 'refunded')
                <p style="color: #15803d; font-size: 14px; margin: 0 0 15px;">
                    Your refund has been processed successfully.
                </p>
                
                <div class="info-row">
                    <span class="info-label">Refund Amount</span>
                    <span class="info-value" style="color: #059669; font-weight: 700;">
                        {{ number_format($refundedPayment->amount_vnd, 0, '.', '.') }}₫
                    </span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Refund Method</span>
                    <span class="info-value">{{ ucfirst(str_replace('_', ' ', $refundedPayment->payment_method)) }}</span>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Processing Time</span>
                    <span class="info-value">5-10 business days</span>
                </div>
            @else
                <p style="color: #15803d; font-size: 14px; margin: 0;">
                    Your refund is being processed and will be credited to your original payment method within 5-10 business days.
                </p>
            @endif
        </div>
    @endif
    
    <!-- Next Steps -->
    <div class="info-card" style="background-color: #eff6ff; border-color: #60a5fa;">
        <h3 class="info-card-title" style="color: #1e40af;">📌 What's Next?</h3>
        <p style="color: #1e3a8a; font-size: 14px; line-height: 1.7; margin: 0;">
            • Your booking slot has been released and is now available for other customers<br>
            • If you paid, the refund will appear in your account within 5-10 business days<br>
            • You can make a new booking anytime on our website<br>
            • Feel free to contact us if you have any questions
        </p>
    </div>
    
    <!-- CTA Button -->
    <div class="button-container">
        <a href="{{ config('app.url') }}/cars" class="email-button">
            Browse Available Cars
        </a>
    </div>
    
    <p class="email-text">
        We're sorry to see this booking cancelled. If there's anything we can do to improve your experience or if you'd like to make a new booking, we're here to help.
    </p>
    
    <p class="email-text" style="margin-top: 30px;">
        Best regards,<br>
        <strong>Auto Rental Vietnam Team</strong>
    </p>
@endsection
