# Quick Start Guide - Test Customer Booking System

## ⚡ 5-Minute Quick Test

### Step 1: Setup (2 phút)

```powershell
# 1. Check .env
# Đảm bảo có các dòng sau:
QUEUE_CONNECTION=database
MAIL_MAILER=log
APP_URL=http://localhost:8000

# 2. Migrate & Seed
php artisan migrate:fresh --seed

# 3. Clear cache
php artisan config:clear
```

### Step 2: Start Servers (1 phút)

**Terminal 1**:
```powershell
composer dev
```

**Terminal 2**:
```powershell
npm run dev
```

### Step 3: Test Full Flow (2 phút)

#### 3.1. Login

1. Vào: `http://localhost:8000/login`
2. Credentials (từ seeder):
   - Email: Check trong `DatabaseSeeder.php` hoặc tạo mới
   - Password: `password`

#### 3.2. Quick Booking Test

**Create test booking via Tinker**:

```powershell
php artisan tinker
```

```php
// Tạo confirmed booking với email
$user = User::where('role', 'customer')->first();
$car = Car::first();
$loc = Location::first();

$booking = Booking::create([
    'booking_code' => 'TEST' . strtoupper(substr(uniqid(), -6)),
    'user_id' => $user->id,
    'owner_id' => $car->owner_id,
    'car_id' => $car->id,
    'pickup_location_id' => $loc->id,
    'return_location_id' => $loc->id,
    'pickup_datetime' => now()->addDays(2),
    'return_datetime' => now()->addDays(5),
    'status' => 'confirmed',
    'payment_status' => 'paid',
    'total_amount' => 3000000,
    'hourly_rate' => 0,
    'daily_rate' => 1000000,
]);

// Test send email
Mail::to($user->email)->queue(new App\Mail\BookingConfirmation($booking));

echo "✅ Created: " . $booking->booking_code . "\n";
echo "📧 Email queued!\n";
exit;
```

#### 3.3. Verify

**Dashboard**: `http://localhost:8000/customer/dashboard`
- ✅ Stats showing 1+ booking
- ✅ Upcoming bookings section has data

**Bookings**: `http://localhost:8000/customer/bookings`
- ✅ Booking card appears
- ✅ Click "View Details" works

**Email**: Check logs
```powershell
Get-Content storage\logs\laravel.log -Tail 50 | Select-String "Booking Confirmation"
```

---

## 🎯 Test Each Feature

### Test 1: Dashboard (30 giây)

```
URL: /customer/dashboard
Check: Stats cards, Upcoming section, Active section
```

### Test 2: Booking List (30 giây)

```
URL: /customer/bookings
Check: Filters (Status dropdown), Search, Pagination
Test: Change status filter → results update
```

### Test 3: Booking Detail (30 giây)

```
URL: /customer/bookings/{id}
Check: All info cards display, Cancel button (if eligible)
```

### Test 4: Cancel Booking (1 phút)

```
1. Click "Cancel Booking"
2. Enter reason: "Test cancellation"
3. Confirm
4. Check email sent: Get-Content storage\logs\laravel.log -Tail 30
```

### Test 5: Reminder Email (1 phút)

```powershell
# Create booking with pickup = 24h from now
php artisan tinker
```

```php
$user = User::first();
$car = Car::first();
$loc = Location::first();

Booking::create([
    'booking_code' => 'REM' . uniqid(),
    'user_id' => $user->id,
    'owner_id' => $car->owner_id,
    'car_id' => $car->id,
    'pickup_location_id' => $loc->id,
    'return_location_id' => $loc->id,
    'pickup_datetime' => now()->addHours(24),
    'return_datetime' => now()->addHours(48),
    'status' => 'confirmed',
    'total_amount' => 1000000,
    'daily_rate' => 500000,
]);
exit;
```

```powershell
# Run reminder command
php artisan bookings:send-reminders

# Check output: "Successfully sent 1 reminder email(s)"
```

---

## 🧪 Test PayPal (Optional - 5 phút)

### Setup PayPal Sandbox

1. **Get Credentials**:
   - https://developer.paypal.com/ → Login
   - My Apps & Credentials → Sandbox → Create App
   - Copy Client ID + Secret

2. **Update .env**:
   ```bash
   PAYPAL_MODE=sandbox
   PAYPAL_SANDBOX_CLIENT_ID=your_client_id
   PAYPAL_SANDBOX_CLIENT_SECRET=your_secret
   ```

3. **Restart**: `php artisan config:clear` + restart `composer dev`

### Test Payment Flow

1. **Checkout**:
   - Browse cars → Select car → Book Now
   - Fill form (dates, locations)
   - Select Payment Method: **PayPal**
   - Submit

2. **PayPal Sandbox**:
   - Login với sandbox Personal account (from PayPal dashboard)
   - Click "Complete Purchase"

3. **Verify**:
   - ✅ Redirect to confirmation page
   - ✅ Booking status = "Confirmed"
   - ✅ Payment status = "Paid"
   - ✅ Email sent (check logs)

---

## 🔍 Quick Debug Commands

```powershell
# Check if queue worker running
Get-Process | Where-Object {$_.Name -like "*php*"}

# Check queued jobs
php artisan tinker
DB::table('jobs')->count()

# Check failed jobs
DB::table('failed_jobs')->count()

# Retry failed jobs
php artisan queue:retry all

# Clear all caches
php artisan optimize:clear

# View customer routes
php artisan route:list | Select-String "customer"

# Check recent logs
Get-Content storage\logs\laravel.log -Tail 20
```

---

## ✅ Success Checklist

After testing, you should have:

- [x] Customer dashboard showing stats
- [x] Booking list with working filters
- [x] Booking detail page displays correctly
- [x] Cancel booking sends email
- [x] Queue worker processes jobs
- [x] Emails logged/sent (check logs or Mailtrap)
- [x] Reminder command works
- [x] PayPal payment flow complete (if tested)

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Queue not processing | Check `composer dev` terminal, restart if needed |
| Email not sent | Verify `MAIL_MAILER=log` and check laravel.log |
| Inertia view not found | Run `npm run build` or `npm run dev` |
| PayPal error | Verify credentials in .env, run `php artisan config:clear` |
| Database error | Run `php artisan migrate:fresh --seed` |

---

## 📚 Full Documentation

For detailed testing guide, see: `docs/TESTING-GUIDE.md`

For email setup options (Mailtrap, Gmail, SendGrid), see: `docs/04-email-notifications.md`

For PayPal configuration, see: `docs/03-paypal-payment-integration.md`

---

**Ready to test!** 🚀

Start with: `composer dev` in Terminal 1, `npm run dev` in Terminal 2, then visit `http://localhost:8000`
