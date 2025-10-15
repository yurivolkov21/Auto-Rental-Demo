# PayPal Integration - Admin Panel Only

## ✅ Current Implementation (Admin Panel)

### Backend Components
- **`config/paypal.php`** - PayPal configuration
- **`database/migrations/*_create_payments_table.php`** - Payments table schema
- **`database/factories/PaymentFactory.php`** - Factory for test data
- **`app/Models/Payment.php`** - Payment Eloquent model
- **`app/Services/PayPalService.php`** - PayPal API service (for future use)
- **`app/Http/Controllers/Admin/AdminPaymentController.php`** - Admin payment management

### Frontend Components (Admin Only)
- **`resources/js/pages/admin/payments/index.tsx`** - Payment list page
- **`resources/js/pages/admin/payments/show.tsx`** - Payment detail page
- **`resources/js/types/models/payment.ts`** - TypeScript types

### Routes (Admin Panel)
```php
// routes/admin.php
GET  /admin/payments              - List all payments
GET  /admin/payments/{payment}    - View payment details
POST /admin/payments/{payment}/refund - Issue refund
```

---

## 🎯 Admin Features

1. **View All Payments**
   - Filter by status, method, type
   - Search by transaction ID, booking code
   - Stats cards (total, completed, pending, failed)
   - Pagination

2. **View Payment Details**
   - Full payment information
   - PayPal transaction details
   - Associated booking info
   - Timestamps

3. **Issue Refund**
   - Refund button for completed payments
   - Add refund reason
   - Updates database (TODO: integrate with PayPal Refund API)

---

## 📝 Setup Instructions

### 1. Environment Variables (.env)
```env
PAYPAL_MODE=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_secret
PAYPAL_LIVE_CLIENT_ID=
PAYPAL_LIVE_CLIENT_SECRET=
PAYPAL_CURRENCY=USD
```

Get credentials from: https://developer.paypal.com/dashboard/

### 2. Database
```bash
php artisan migrate  # Already done
```

### 3. Test Data (Optional)
```bash
php artisan tinker
```
```php
// Create test payments
Payment::factory()->count(10)->create();

// Create completed payments
Payment::factory()->completed()->count(5)->create();

// Create PayPal payments
Payment::factory()->paypal()->completed()->count(3)->create();
```

---

## 🚀 Access Admin Panel

```
http://localhost/admin/payments
```

Requirements:
- User must be logged in
- User role must be 'admin'

---

## 📊 Database Schema

### Payments Table
- `transaction_id` - Unique transaction identifier
- `booking_id` - Related booking
- `user_id` - Customer who paid
- `payment_method` - paypal, credit_card, bank_transfer, cash, wallet
- `payment_type` - deposit, full_payment, partial, refund
- `amount` - Payment amount
- `currency` - Currency code (USD, VND, etc.)
- `status` - pending, completed, failed, refunded, cancelled
- `paypal_order_id` - PayPal Order ID (for PayPal payments)
- `paypal_payer_id` - PayPal Payer ID
- `paypal_payer_email` - Payer's email
- `paypal_response` - Full PayPal API response (JSON)
- `notes` - Additional notes
- `paid_at` - Payment completion timestamp
- `refunded_at` - Refund timestamp

---

## 🔜 Not Implemented Yet (Customer Side)

These features will be implemented later when customer booking pages are ready:

- ❌ Customer payment page
- ❌ PayPal button integration for customers
- ❌ Payment success/cancel redirects
- ❌ PayPal webhook handling
- ❌ Customer payment history
- ❌ Email notifications
- ❌ Payment receipts

---

## 🛠️ TODO for Future

1. **PayPal Refund API Integration**
   - Implement actual PayPal refund in `AdminPaymentController@refund()`
   - Currently only updates database

2. **Customer Payment Flow**
   - Create customer booking pages first
   - Then add PayPal payment integration

3. **Webhook Handler**
   - Implement PayPal webhook verification
   - Handle payment disputes, chargebacks

4. **Enhanced Features**
   - Payment analytics/reports
   - Export payment data
   - Bulk operations
   - Payment reminders

---

## 🔐 Security Notes

- Admin routes are protected by auth + admin middleware
- PayPal credentials stored in .env (never commit)
- Use HTTPS in production
- Implement webhook signature verification for production

---

## 📚 Resources

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Orders API Docs](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Checkout SDK (PHP)](https://github.com/paypal/Checkout-PHP-SDK)

---

**Last Updated:** October 15, 2025  
**Status:** Admin Panel Complete, Customer Side Pending
