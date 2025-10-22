# PayPal Payment Integration - Setup Guide

## Overview
This application integrates PayPal as a payment gateway for car rental bookings. Payments are processed in USD and converted from VND at current exchange rates.

## Features Implemented
- ✅ Create PayPal orders from bookings
- ✅ Redirect to PayPal for payment approval
- ✅ Capture payments after approval
- ✅ Handle success/cancel callbacks
- ✅ Dual currency support (VND → USD conversion)
- ✅ Payment tracking with full audit trail
- ✅ Refund processing

## PayPal Configuration

### 1. Get PayPal Credentials

**Sandbox (Development):**
1. Go to https://developer.paypal.com/
2. Login with your PayPal account
3. Navigate to "Dashboard" → "My Apps & Credentials"
4. Under "Sandbox", create a new app
5. Copy your **Client ID** and **Secret**

**Live (Production):**
1. Same process as above
2. Use "Live" credentials instead of "Sandbox"
3. Your PayPal Business account must be approved

### 2. Environment Variables

Add these to your `.env` file:

```bash
# PayPal Configuration
PAYPAL_MODE=sandbox # Use 'live' for production
PAYPAL_CURRENCY=USD

# Sandbox Credentials
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_secret_here

# Live Credentials (Production only)
PAYPAL_LIVE_CLIENT_ID=your_live_client_id_here
PAYPAL_LIVE_CLIENT_SECRET=your_live_secret_here

# Exchange Rate API (for VND → USD conversion)
EXCHANGE_RATE_API_KEY=your_api_key_here # Optional: Get from exchangerate-api.com
```

### 3. Return URLs

The following URLs are automatically configured in `config/paypal.php`:

- **Success URL**: `{APP_URL}/payment/paypal/success`
- **Cancel URL**: `{APP_URL}/payment/paypal/cancel`

Make sure your `APP_URL` in `.env` is correctly set:
```bash
APP_URL=http://localhost:8000 # Development
APP_URL=https://yourdomain.com # Production
```

## Payment Flow

### Customer Journey

1. **Checkout**: Customer fills booking details
2. **Select PayPal**: Choose PayPal as payment method
3. **Create Booking**: System creates booking with status "pending"
4. **Initiate Payment**: Backend creates PayPal order (VND → USD)
5. **Redirect to PayPal**: Customer approves payment on PayPal
6. **Return Success**: PayPal redirects to success URL
7. **Capture Payment**: Backend captures the payment
8. **Update Booking**: Booking status → "confirmed", payment_status → "paid"
9. **Confirmation**: Customer sees confirmation page

### Technical Flow

```
Customer → Checkout Page
    ↓
POST /booking/store (create booking)
    ↓
POST /payment/process (create PayPal order)
    ↓
Redirect to PayPal approval_url
    ↓
Customer approves on PayPal
    ↓
PayPal redirects to /payment/paypal/success?token={order_id}
    ↓
Backend captures order (POST to PayPal API)
    ↓
Update booking + payment records
    ↓
Redirect to /booking/{id}/confirmation
```

## Database Schema

### `payments` table
```sql
- id
- transaction_id (PayPal order ID)
- booking_id
- user_id
- payment_method ('paypal', 'credit_card', 'bank_transfer')
- payment_type ('deposit', 'full_payment', 'partial')
- amount_vnd (primary amount in VND)
- amount_usd (amount sent to PayPal)
- exchange_rate (rate at payment time)
- currency ('VND')
- status ('pending', 'completed', 'failed', 'refunded')
- paypal_order_id
- paypal_payer_id
- paypal_payer_email
- paypal_response (JSON - full PayPal API response)
- notes
- paid_at
- refunded_at
- created_at
- updated_at
```

## API Endpoints

### Public Routes (Authenticated)

**Create Booking:**
```
POST /booking/store
Body: {
    car_id, pickup_datetime, return_datetime,
    pickup_location_id, return_location_id,
    driver_id, promotion_code, payment_method, special_requests
}
Response: { success, booking_id, booking_code, total_amount }
```

**Process Payment:**
```
POST /payment/process
Body: {
    booking_id, payment_method: 'paypal', payment_type: 'full_payment'
}
Response: {
    success, payment_method, order_id, approval_url,
    amount_vnd, amount_usd
}
```

**PayPal Success Callback:**
```
GET /payment/paypal/success?token={order_id}
→ Captures payment
→ Redirects to /booking/{id}/confirmation
```

**PayPal Cancel Callback:**
```
GET /payment/paypal/cancel?token={order_id}
→ Shows cancellation page with retry options
```

## Testing with PayPal Sandbox

### 1. Create Test Accounts

In PayPal Developer Dashboard:
1. Go to "Sandbox" → "Accounts"
2. You'll see pre-created test accounts (Personal + Business)
3. Note the email and password for Personal account

### 2. Test Payment Flow

1. Start your local server: `php artisan serve`
2. Go through booking flow
3. Select PayPal payment
4. Login with **Sandbox Personal Account** credentials
5. Approve the payment
6. Check that booking is confirmed

### 3. Verify in Dashboard

- Check "Sandbox" → "Transactions" to see test payments
- Verify amounts are correct (in USD)
- Check your database `payments` table

## Currency Conversion

The system uses `CurrencyService` to convert VND → USD:

1. **Exchange Rate Source**: ExchangeRate-API (https://www.exchangerate-api.com/)
2. **Fallback Rate**: 24,000 VND = 1 USD (if API fails)
3. **Stored Fields**:
   - `amount_vnd`: Original amount (e.g., 2,400,000 VND)
   - `amount_usd`: Converted amount (e.g., 100.00 USD)
   - `exchange_rate`: Rate at payment time (e.g., 24000.00)

## Error Handling

### Common Errors

**1. "Failed to create PayPal order"**
- Check PayPal credentials in `.env`
- Verify `PAYPAL_MODE` is set correctly
- Check PayPal API logs

**2. "Payment capture failed"**
- Order may have expired (valid for 3 hours)
- Customer didn't complete approval
- Check PayPal sandbox for order status

**3. "Currency conversion failed"**
- ExchangeRate API may be down
- System will use fallback rate (24,000)
- Check `EXCHANGE_RATE_API_KEY` if configured

### Debugging

Enable debug mode in `.env`:
```bash
APP_DEBUG=true
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

Check logs:
```bash
tail -f storage/logs/laravel.log
```

## Security Notes

1. **Never commit credentials** to Git
2. Use different credentials for Sandbox and Live
3. Validate all webhook signatures (if implementing webhooks)
4. Always verify order amounts match booking amounts
5. Check order status before capture
6. Store full PayPal response for audit trails

## Refunds

To refund a payment:

```php
use App\Services\PayPalService;
use App\Models\Payment;

$payment = Payment::find($paymentId);
$paypalService = app(PayPalService::class);

$result = $paypalService->refundPayment(
    $payment, 
    'Refund reason here'
);
```

**Note**: Refunds can take 5-10 days to process through PayPal.

## Production Checklist

Before going live:

- [ ] Update `PAYPAL_MODE=live` in `.env`
- [ ] Use Live credentials (not Sandbox)
- [ ] Test with real PayPal account (use small amounts)
- [ ] Verify return URLs are HTTPS
- [ ] Set up proper error monitoring
- [ ] Configure email notifications
- [ ] Test refund process
- [ ] Review PayPal fee structure
- [ ] Enable 2FA on PayPal Business account
- [ ] Set up PayPal webhooks for payment notifications

## Support

- **PayPal Developer**: https://developer.paypal.com/support/
- **PayPal SDK**: https://github.com/paypal/PayPal-PHP-SDK
- **ExchangeRate API**: https://www.exchangerate-api.com/docs

## Next Steps (Future Enhancements)

- [ ] Implement credit card processing (Stripe/Braintree)
- [ ] Add payment installments
- [ ] Set up PayPal webhooks for real-time notifications
- [ ] Implement automatic refunds on booking cancellation
- [ ] Add payment reminders for unpaid bookings
- [ ] Support multiple currencies (EUR, JPY, etc.)
