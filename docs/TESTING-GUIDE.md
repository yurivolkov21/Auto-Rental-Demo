# Hướng Dẫn Test Customer Booking System & Email Notifications

## 📋 Checklist Trước Khi Bắt Đầu

- [ ] Database đã migrate & seed
- [ ] Queue connection = database
- [ ] Mail mailer = log (development) hoặc Mailtrap (testing emails)
- [ ] PayPal sandbox credentials configured (optional - để test payment)
- [ ] Frontend build đã chạy

## 🚀 Bước 1: Setup Environment

### 1.1. Kiểm Tra File .env

Mở file `.env` và đảm bảo các giá trị sau:

```bash
APP_URL=http://localhost:8000

# Queue (để gửi email async)
QUEUE_CONNECTION=database

# Mail (chọn 1 trong 2 options)

# OPTION 1: Log to file (đơn giản nhất - email sẽ xuất hiện trong laravel.log)
MAIL_MAILER=log

# OPTION 2: Mailtrap (xem email trong inbox giả - RECOMMENDED)
# Đăng ký free tại: https://mailtrap.io
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username_here
MAIL_PASSWORD=your_mailtrap_password_here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@autorental.vn
MAIL_FROM_NAME="Auto Rental Vietnam"

# PayPal Sandbox (optional - để test payment)
PAYPAL_MODE=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_secret
```

### 1.2. Chạy Migrations & Seeders

```powershell
# Clear cache
php artisan config:clear
php artisan cache:clear

# Migrate fresh database với seeders
php artisan migrate:fresh --seed
```

**Kết quả mong đợi**: Database có sample data (users, cars, locations, etc.)

### 1.3. Start Development Servers

**Terminal 1** - Laravel + Queue Worker:
```powershell
composer dev
```

Lệnh này sẽ chạy đồng thời:
- Laravel server: `http://localhost:8000`
- Queue worker: Xử lý email jobs

**Terminal 2** - Frontend Vite:
```powershell
npm run dev
```

**Kiểm tra**:
- Mở browser: `http://localhost:8000`
- Trang home phải load được

---

## 🧪 Bước 2: Test Customer Dashboard & Booking Management

### 2.1. Tạo Tài Khoản Customer

**Cách 1: Dùng seeded user**

Database seeder đã tạo sẵn users. Check trong `DatabaseSeeder.php` hoặc:

```powershell
php artisan tinker
```

```php
// Tìm user với role customer
$user = User::where('role', 'customer')->first();
echo $user->email . "\n";
echo "Password: password\n"; // Default password trong seeder
```

**Cách 2: Đăng ký mới**

1. Vào `http://localhost:8000/register`
2. Điền form đăng ký
3. Submit → Auto login

### 2.2. Test Customer Dashboard

**URL**: `http://localhost:8000/customer/dashboard`

**Kiểm tra**:
- [ ] Stats cards hiển thị đúng (Total, Upcoming, Active, Completed bookings)
- [ ] "Upcoming Bookings" section (bookings trong 30 ngày tới)
- [ ] "Active Bookings" section (bookings đang active)
- [ ] Click "View All Bookings" → redirect đến `/customer/bookings`

**Nếu chưa có bookings**:
- Stats sẽ show 0
- Sections sẽ show "No bookings found"
- Tạo booking mới ở bước tiếp theo

### 2.3. Test Booking List Page

**URL**: `http://localhost:8000/customer/bookings`

**Kiểm tra**:
- [ ] Stats bar ở top (Total, Upcoming, Active, Completed)
- [ ] Filters:
  - Status dropdown (All, Pending, Confirmed, Active, Completed, Cancelled)
  - Search box (tìm theo booking code hoặc car name)
- [ ] Booking cards hiển thị:
  - Car image
  - Car name + brand
  - Booking code
  - Status badge (color-coded)
  - Payment status badge
  - Pickup/Return dates
  - Total amount (VND format)
  - "View Details" button
- [ ] Pagination (nếu > 10 bookings)

**Test filters**:
1. Chọn Status = "Confirmed" → chỉ show confirmed bookings
2. Search "Toyota" → chỉ show bookings có Toyota
3. Clear filters → show tất cả

### 2.4. Test Booking Detail Page

**URL**: `http://localhost:8000/customer/bookings/{id}`

**Kiểm tra**:
- [ ] Booking header:
  - Booking code
  - Dual status badges (Booking Status + Payment Status)
  - Action buttons (Cancel Booking nếu eligible)
- [ ] Vehicle details card:
  - Car image
  - Car name, brand, category
  - Specs (seats, transmission, fuel type)
- [ ] Booking information card:
  - Pickup date/time + location
  - Return date/time + location
  - With driver info (nếu có)
  - Special requests
- [ ] Pricing breakdown card:
  - Deposit amount
  - Total amount
  - Payment method
- [ ] Additional charges (nếu có)
- [ ] Promotions applied (nếu có)

### 2.5. Test Cancel Booking

**Prerequisites**: Booking phải có status "pending" hoặc "confirmed"

**Steps**:
1. Vào booking detail page
2. Click "Cancel Booking" button
3. Dialog xuất hiện
4. Nhập cancellation reason: "Changed travel plans"
5. Click "Cancel Booking" confirm

**Kiểm tra**:
- [ ] Dialog hiển thị cancellation policy (24h rule)
- [ ] Success toast: "Booking cancelled successfully..."
- [ ] Booking status → "Cancelled"
- [ ] Cancel button biến mất
- [ ] Email cancellation sent (check logs/Mailtrap)

**Verify email**:

**Option A - Log mailer**:
```powershell
# Mở file log
Get-Content storage\logs\laravel.log -Tail 50
```

Tìm dòng chứa: `Subject: Booking Cancelled`

**Option B - Mailtrap**:
- Vào Mailtrap inbox
- Thấy email mới: "Booking Cancelled - {code}"
- Verify content: cancellation reason, refund info

---

## 💳 Bước 3: Test PayPal Payment Integration

### 3.1. Setup PayPal Sandbox

**Nếu chưa có credentials**:

1. Vào https://developer.paypal.com/
2. Login (tạo account nếu chưa có)
3. Dashboard → "My Apps & Credentials"
4. Tab "Sandbox"
5. Click "Create App"
   - App Name: "Auto Rental Test"
   - Sandbox Business Account: chọn default
6. Copy **Client ID** và **Secret**
7. Paste vào `.env`:
   ```bash
   PAYPAL_SANDBOX_CLIENT_ID=your_client_id_here
   PAYPAL_SANDBOX_CLIENT_SECRET=your_secret_here
   ```
8. Restart server: `php artisan config:clear` + restart `composer dev`

**Lấy sandbox test account**:
1. Dashboard → "Sandbox" → "Accounts"
2. Thấy 2 accounts:
   - Business (merchant - không dùng)
   - Personal (buyer - dùng để test)
3. Click "..." → "View/Edit Account"
4. Tab "Account Details" → copy Email
5. Tab "Security" → copy Password (hoặc reset nếu quên)

### 3.2. Test Full Booking Flow với PayPal

**Step 1: Browse & Select Car**

1. Vào homepage: `http://localhost:8000`
2. Click "Browse Cars" hoặc vào `/cars`
3. Chọn 1 car → Click "View Details"

**Step 2: Checkout Page**

1. Click "Book Now" button
2. Redirect đến `/booking/{carId}/checkout`
3. **Step 1 - Booking Details**:
   - Pickup Date: Chọn ngày mai
   - Pickup Time: 10:00 AM
   - Return Date: Chọn +3 ngày
   - Return Time: 10:00 AM
   - Pickup Location: Chọn location
   - Return Location: Chọn location (same or different)
   - Driver Service: Toggle ON/OFF (nếu muốn test)
   - Promotion Code: Để trống hoặc nhập code nếu có
   - Special Requests: "Please prepare car carefully"
   - Click "Continue to Review"

4. **Step 2 - Review & Payment**:
   - Verify all details hiển thị đúng
   - Pricing breakdown:
     - Daily rate × days
     - Driver fee (nếu có)
     - Promotion discount (nếu có)
     - Total amount
   - Payment Method: **Chọn "PayPal"**
   - Checkbox "I agree to terms"
   - Click "Complete Booking"

**Step 3: PayPal Redirect**

**Kiểm tra browser**:
- [ ] Page redirect sang PayPal sandbox
- [ ] URL chứa: `sandbox.paypal.com`
- [ ] Order summary hiển thị:
  - Merchant: "Auto Rental Vietnam" (hoặc app name)
  - Amount: $XX.XX USD (converted từ VND)
  - Item: "Car Rental Booking - {car name}"

**Login PayPal Sandbox**:
- Email: (personal account email từ bước 3.1)
- Password: (personal account password)
- Click "Log In"

**Approve Payment**:
- Review order details
- Click "Complete Purchase" button

**Step 4: Return to Site**

**Kiểm tra**:
- [ ] Redirect về `/booking/{id}/confirmation`
- [ ] Success toast: "Payment completed successfully!"
- [ ] Confirmation page hiển thị:
  - Booking code (large, highlighted)
  - Dual status badges:
    - Booking Status: "Confirmed" (green)
    - Payment Status: "Paid" (green)
  - Complete booking details
  - Vehicle info
  - "What's Next" section
  - "View Booking Details" button

**Step 5: Verify Email Sent**

**Check Queue Jobs**:
```powershell
# Kiểm tra jobs table
php artisan tinker
```

```php
DB::table('jobs')->count(); // Nên = 0 (đã process)
DB::table('failed_jobs')->count(); // Nên = 0
```

**Check Email (Log)**:
```powershell
Get-Content storage\logs\laravel.log -Tail 100
```

Tìm:
- `Subject: Booking Confirmation - {code}`
- Content chứa booking details

**Check Email (Mailtrap)**:
- Mở Mailtrap inbox
- Email mới: "Booking Confirmation - {code}"
- Verify:
  - [ ] Header có logo + gradient
  - [ ] Booking reference highlighted
  - [ ] Status badge: "Confirmed" (green)
  - [ ] Vehicle details đúng
  - [ ] Pickup/Return dates + locations đúng
  - [ ] Payment details:
    - Transaction ID
    - Payment Method: PayPal
    - Amount Paid: VND format
  - [ ] Pre-trip checklist
  - [ ] CTA button: "View Full Booking Details"
  - [ ] Footer với contact info

### 3.3. Test PayPal Cancel Flow

**Steps**:
1. Repeat checkout flow như trên
2. Đến trang PayPal
3. **Click "Cancel and return to..."** (link ở top)

**Kiểm tra**:
- [ ] Redirect về `/payment/cancelled?token={order_id}`
- [ ] Cancelled page hiển thị:
  - Warning icon
  - "Payment Cancelled" title
  - Booking code
  - Total amount
  - "What Happens Next" section
  - "Complete Payment" button (retry)
  - "Return Home" button
- [ ] Booking status vẫn "Pending"
- [ ] Payment status vẫn "Pending"

### 3.4. Test Payment Error Handling

**Trigger error** (manual):
```powershell
php artisan tinker
```

```php
$booking = Booking::latest()->first();
$booking->update(['payment_status' => 'failed']);
```

**Navigate to**:
`http://localhost:8000/payment/error`

**Kiểm tra**:
- [ ] Error page hiển thị
- [ ] Error message
- [ ] Support contact info
- [ ] "Try Again" button

---

## 📧 Bước 4: Test Email System

### 4.1. Test Manual Email Send

```powershell
php artisan tinker
```

```php
// Load a booking with relationships
$booking = App\Models\Booking::with([
    'user', 
    'car.brand', 
    'car.category', 
    'pickupLocation', 
    'returnLocation',
    'payments'
])->where('status', 'confirmed')->first();

// Send confirmation email
Mail::to($booking->user->email)->send(new App\Mail\BookingConfirmation($booking));

// Check output
echo "Email sent to: " . $booking->user->email . "\n";
```

**Verify**: Check logs hoặc Mailtrap inbox

### 4.2. Test Booking Reminder Command

**Create test booking với pickup = tomorrow**:

```powershell
php artisan tinker
```

```php
$user = User::where('role', 'customer')->first();
$car = Car::first();
$location = Location::first();

$booking = Booking::create([
    'booking_code' => 'BK' . strtoupper(uniqid()),
    'user_id' => $user->id,
    'owner_id' => $car->owner_id,
    'car_id' => $car->id,
    'pickup_location_id' => $location->id,
    'return_location_id' => $location->id,
    'pickup_datetime' => now()->addHours(24), // Exactly 24h from now
    'return_datetime' => now()->addHours(48),
    'status' => 'confirmed',
    'payment_status' => 'paid',
    'total_amount' => 2000000,
    'hourly_rate' => 0,
    'daily_rate' => 1000000,
]);

echo "Created booking: " . $booking->booking_code . "\n";
echo "Pickup: " . $booking->pickup_datetime . "\n";
```

**Run reminder command**:
```powershell
php artisan bookings:send-reminders
```

**Expected output**:
```
Reminder sent to user@example.com for booking BK...
Successfully sent 1 reminder email(s).
```

**Verify email**:
- Check logs/Mailtrap
- Subject: "Reminder: Your booking is coming up - {code}"
- Content:
  - "Time Until Pickup: 24 hours"
  - Booking details
  - Pre-trip checklist
  - Support contact info

### 4.3. Test Email Layouts

**Check HTML version**:
- Mailtrap → Click email → Tab "HTML"
- Verify:
  - [ ] Responsive (looks good on preview)
  - [ ] Gradient header (blue)
  - [ ] Cards with proper spacing
  - [ ] Buttons clickable
  - [ ] Footer complete

**Check Plain Text version**:
- Mailtrap → Click email → Tab "Text"
- Verify:
  - [ ] Readable plain text version
  - [ ] All info present (no HTML tags)
  - [ ] Proper formatting with line breaks

### 4.4. Test Queue Worker

**Stop queue worker** (Ctrl+C trong terminal chạy `composer dev`)

**Create a booking** → Payment success

**Check jobs table**:
```powershell
php artisan tinker
```

```php
DB::table('jobs')->count(); // Should be 1 (queued email)
```

**Start queue worker**:
```powershell
php artisan queue:work --once
```

**Verify**:
```php
DB::table('jobs')->count(); // Should be 0 (processed)
```

Email sent!

---

## 🐛 Bước 5: Troubleshooting Common Issues

### Issue 1: "Inertia view not found"

**Symptom**: Error khi vào customer pages

**Solution**:
```powershell
# Rebuild frontend
npm run build

# Or run dev server
npm run dev
```

### Issue 2: Queue worker không chạy

**Symptom**: Emails không được gửi

**Check**:
```powershell
# Check if queue:work is running
Get-Process | Where-Object {$_.ProcessName -like "*php*"}
```

**Solution**:
```powershell
# Restart composer dev
# Stop current process (Ctrl+C)
composer dev
```

### Issue 3: PayPal error "Invalid client credentials"

**Symptom**: Payment fails immediately

**Solution**:
1. Verify `.env` credentials
2. Check PAYPAL_MODE=sandbox
3. Run: `php artisan config:clear`
4. Restart server

### Issue 4: Email không xuất hiện trong Mailtrap

**Symptom**: Queue processed nhưng không thấy email

**Check**:
```powershell
Get-Content storage\logs\laravel.log -Tail 50
```

Look for "Connection refused" hoặc SMTP errors

**Solution**:
1. Verify Mailtrap credentials trong `.env`
2. Check MAIL_MAILER=smtp
3. Test connection:
   ```powershell
   php artisan tinker
   ```
   ```php
   Mail::raw('Test', fn($msg) => $msg->to('test@test.com')->subject('Test'));
   ```

### Issue 5: "Class BookingConfirmation not found"

**Symptom**: Error khi gửi email

**Solution**:
```powershell
composer dump-autoload
php artisan clear-compiled
```

---

## ✅ Bước 6: Final Checklist

### Customer Dashboard ✓
- [ ] Dashboard loads với stats
- [ ] Upcoming bookings section works
- [ ] Active bookings section works
- [ ] Links navigate correctly

### Booking Management ✓
- [ ] Booking list với filters
- [ ] Search functionality
- [ ] Pagination
- [ ] Booking detail page
- [ ] Cancel booking
- [ ] Cancellation email sent

### PayPal Payment ✓
- [ ] Checkout form validation
- [ ] PayPal redirect works
- [ ] Payment success flow
- [ ] Confirmation page displays correctly
- [ ] Confirmation email sent
- [ ] Payment cancel flow
- [ ] Error handling

### Email System ✓
- [ ] Confirmation email (HTML + Text)
- [ ] Cancellation email (HTML + Text)
- [ ] Reminder email (HTML + Text)
- [ ] Queue worker processes jobs
- [ ] Reminder command works
- [ ] Scheduled task configured

---

## 📊 Bước 7: Demo Data for Testing

**Quick create complete test scenario**:

```powershell
php artisan tinker
```

```php
// 1. Tạo customer user
$customer = User::factory()->create([
    'email' => 'customer@test.com',
    'role' => 'customer',
    'password' => bcrypt('password123'),
]);

// 2. Tạo confirmed booking với payment
$car = Car::with('owner')->first();
$location = Location::first();

$booking = Booking::create([
    'booking_code' => 'TEST' . strtoupper(uniqid()),
    'user_id' => $customer->id,
    'owner_id' => $car->owner_id,
    'car_id' => $car->id,
    'pickup_location_id' => $location->id,
    'return_location_id' => $location->id,
    'pickup_datetime' => now()->addDays(2),
    'return_datetime' => now()->addDays(5),
    'status' => 'confirmed',
    'payment_status' => 'paid',
    'payment_method' => 'paypal',
    'total_amount' => 3000000,
    'hourly_rate' => 0,
    'daily_rate' => 1000000,
]);

// 3. Tạo payment record
$payment = Payment::create([
    'transaction_id' => 'TXN' . uniqid(),
    'booking_id' => $booking->id,
    'user_id' => $customer->id,
    'payment_method' => 'paypal',
    'payment_type' => 'full_payment',
    'amount_vnd' => 3000000,
    'amount_usd' => 122.45,
    'exchange_rate' => 24500,
    'currency' => 'VND',
    'status' => 'completed',
    'paid_at' => now(),
]);

echo "Created test data:\n";
echo "User: customer@test.com / password123\n";
echo "Booking: " . $booking->booking_code . "\n";
echo "Login and check dashboard!\n";
```

**Login credentials**:
- Email: `customer@test.com`
- Password: `password123`

---

## 🎯 Expected Results Summary

**After completing all tests, you should have**:

1. ✅ Customer can view dashboard with stats
2. ✅ Customer can list all their bookings with filters
3. ✅ Customer can view booking details
4. ✅ Customer can cancel bookings (with email notification)
5. ✅ Complete booking with PayPal payment works
6. ✅ Payment success redirects to confirmation page
7. ✅ Confirmation email sent automatically
8. ✅ Cancellation email sent when booking cancelled
9. ✅ Reminder email can be sent 24h before pickup
10. ✅ Queue system processes email jobs
11. ✅ All emails are mobile-responsive with professional design

**Logs to monitor**:
- `storage/logs/laravel.log` - General app logs + email logs
- Queue jobs processing in terminal
- Browser console for frontend errors
- Network tab for API calls

---

## 📞 Need Help?

**Common Questions**:

Q: Email không được gửi sau payment success?
A: Check queue worker đang chạy (`composer dev` terminal 1)

Q: PayPal redirect không hoạt động?
A: Verify sandbox credentials trong `.env` và restart server

Q: Frontend không hiển thị pages mới?
A: Run `npm run build` hoặc `npm run dev`

Q: Database lỗi "table not found"?
A: Run `php artisan migrate:fresh --seed`

**Debug Commands**:
```powershell
# Check queue jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear all cache
php artisan optimize:clear

# View routes
php artisan route:list | Select-String "customer"

# Test email config
php artisan tinker
Mail::raw('Test', fn($m) => $m->to('test@test.com')->subject('Test'));
```

Good luck testing! 🚀
