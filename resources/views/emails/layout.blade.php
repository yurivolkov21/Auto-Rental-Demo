<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Auto Rental Vietnam' }}</title>
    <style>
        /* Reset styles */
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            color: #111827;
            line-height: 1.6;
        }
        
        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        /* Header */
        .email-header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            padding: 40px 20px;
            text-align: center;
        }
        
        .email-logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
            letter-spacing: -0.5px;
        }
        
        .email-tagline {
            color: #93c5fd;
            font-size: 14px;
            margin: 8px 0 0;
        }
        
        /* Content */
        .email-content {
            padding: 40px 30px;
        }
        
        .email-greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 20px;
        }
        
        .email-text {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.7;
            margin: 0 0 20px;
        }
        
        /* Card/Box styles */
        .info-card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .info-card-title {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin: 0 0 15px;
            display: flex;
            align-items: center;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            color: #6b7280;
            font-size: 14px;
        }
        
        .info-value {
            color: #111827;
            font-size: 14px;
            font-weight: 500;
            text-align: right;
        }
        
        /* Highlight box */
        .highlight-box {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px solid #2563eb;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .highlight-label {
            color: #1e40af;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 8px;
        }
        
        .highlight-value {
            color: #1e3a8a;
            font-size: 28px;
            font-weight: bold;
            margin: 0;
        }
        
        /* Button */
        .email-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .email-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
        }
        
        .status-confirmed {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .status-cancelled {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
            margin: 0 0 15px;
        }
        
        .footer-links {
            margin: 15px 0;
        }
        
        .footer-link {
            color: #2563eb;
            text-decoration: none;
            font-size: 13px;
            margin: 0 10px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .social-links {
            margin: 20px 0 0;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #6b7280;
            text-decoration: none;
            font-size: 20px;
        }
        
        /* Divider */
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 25px 0;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-content {
                padding: 30px 20px;
            }
            
            .info-row {
                flex-direction: column;
            }
            
            .info-value {
                text-align: left;
                margin-top: 5px;
            }
            
            .highlight-value {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1 class="email-logo">Auto Rental Vietnam</h1>
            <p class="email-tagline">Premium Car Rental Service</p>
        </div>
        
        <!-- Content -->
        <div class="email-content">
            @yield('content')
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <p class="footer-text">
                Need help? Our support team is here for you 24/7.
            </p>
            
            <div class="footer-links">
                <a href="{{ config('app.url') }}/contact" class="footer-link">Contact Support</a>
                <a href="{{ config('app.url') }}/customer/bookings" class="footer-link">My Bookings</a>
                <a href="{{ config('app.url') }}/faq" class="footer-link">FAQ</a>
            </div>
            
            <div class="divider"></div>
            
            <p class="footer-text">
                <strong>Auto Rental Vietnam</strong><br>
                Hanoi, Vietnam<br>
                Email: support@autorental.vn | Phone: +84 123 456 789
            </p>
            
            <p class="footer-text" style="font-size: 11px; color: #9ca3af;">
                You received this email because you made a booking with Auto Rental Vietnam.<br>
                © {{ date('Y') }} Auto Rental Vietnam. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
