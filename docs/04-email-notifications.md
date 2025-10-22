# Email Notifications System

## Overview

The Auto Rental Vietnam platform includes a comprehensive email notification system to keep customers informed throughout their booking journey. All emails are sent asynchronously via Laravel's queue system to ensure fast response times.

## Implemented Email Types

### 1. Booking Confirmation Email

**Trigger**: Automatically sent after successful payment completion

**Sent From**: `PaymentController@paypalSuccess()`

**Recipients**: Customer who made the booking

**Contains**:
- Booking reference code (highlighted)
- Booking status badge (Confirmed)
- Vehicle details (brand, model, category)
- Pickup date/time and location
- Return date/time and location
- Driver service info (if applicable)
- Payment transaction details
- Amount paid with VND currency
- Important pre-trip checklist
- CTA button: "View Full Booking Details"

**Template Files**:
- HTML: `resources/views/emails/booking-confirmation.blade.php`
- Plain Text: `resources/views/emails/booking-confirmation-text.blade.php`

**Mailable Class**: `App\Mail\BookingConfirmation`

---

### 2. Booking Cancellation Email

**Trigger**: Sent when customer cancels a booking

**Sent From**: `Customer\BookingController@cancel()`

**Recipients**: Customer who cancelled the booking

**Contains**:
- Cancelled booking reference code
- Cancellation status badge
- Cancellation date and reason
- Original booking details (vehicle, dates, amount)
- Refund information (if payment was processed)
  - Refund amount in VND
  - Refund method (same as payment method)
  - Processing time: 5-10 business days
- Next steps information
- CTA button: "Browse Available Cars"

**Template Files**:
- HTML: `resources/views/emails/booking-cancelled.blade.php`
- Plain Text: `resources/views/emails/booking-cancelled-text.blade.php`

**Mailable Class**: `App\Mail\BookingCancelled`

---

### 3. Booking Reminder Email

**Trigger**: Scheduled task runs hourly, sends to bookings 24 hours before pickup

**Sent From**: Console command `bookings:send-reminders`

**Recipients**: Customers with confirmed bookings pickup within 24 hours

**Contains**:
- Time remaining until pickup (in hours)
- Booking reference code
- Full booking details (vehicle, dates, locations)
- Driver information (if with driver service)
- Pickup location with full address
- Pre-trip checklist:
  - Documents to bring (license, ID, booking confirmation)
  - Arrival instructions (15 minutes early)
- 24/7 support contact information
- CTA button: "View Booking Details"

**Template Files**:
- HTML: `resources/views/emails/booking-reminder.blade.php`
- Plain Text: `resources/views/emails/booking-reminder-text.blade.php`

**Mailable Class**: `App\Mail\BookingReminder`

---

## Email Design System

### Base Layout

All emails extend the base layout: `resources/views/emails/layout.blade.php`

**Design Features**:
- Responsive design (mobile-friendly)
- Professional gradient header (blue theme)
- Clean typography with proper hierarchy
- Color-coded status badges
- Highlighted key information (booking codes, amounts)
- CTA buttons with hover effects
- Comprehensive footer with links and contact info

**Color Palette**:
- **Primary Blue**: `#2563eb` (headers, buttons, links)
- **Blue Gradient**: `#2563eb` to `#1d4ed8`
- **Success Green**: `#d1fae5` background, `#065f46` text
- **Warning Yellow**: `#fef3c7` background, `#92400e` text
- **Danger Red**: `#fee2e2` background, `#991b1b` text
- **Info Blue**: `#eff6ff` background, `#1e40af` text

### Typography

- **Heading**: 18px, weight 600
- **Body Text**: 15px, line-height 1.7, color `#4b5563`
- **Labels**: 14px, color `#6b7280`
- **Values**: 14px, weight 500, color `#111827`
- **Highlight**: 28px, bold, gradient text

### Components

**Info Card**: Gray background card with rows of label-value pairs

**Highlight Box**: Gradient background with border, centered content for important info

**Status Badges**: Inline badges with icons (confirmed, cancelled, pending, refunded)

**CTA Button**: Full-width gradient button with rounded corners

---

## Queue System

### Configuration

**Queue Driver**: Database (`jobs` table)

**Config File**: `config/queue.php`

**Default Connection**: `database` (from `QUEUE_CONNECTION` env var)

### Required Database Tables

Already migrated in: `database/migrations/2025_10_02_000000_create_jobs_table.php`

Tables:
- `jobs` - Pending queue jobs
- `job_batches` - Batch tracking
- `failed_jobs` - Failed job records

### Running the Queue Worker

**Development (with Laravel dev script)**:

```bash
composer dev
```

This runs both Laravel server and queue worker.

**Manual Queue Worker**:

```bash
php artisan queue:work --tries=3 --timeout=60
```

**Production (with Supervisor)**:

See `docs/04-email-notifications.md` for Supervisor configuration.

---

## Scheduled Tasks

### Booking Reminders

**Schedule**: Runs every hour

**Configured In**: `routes/console.php`

```php
Schedule::command('bookings:send-reminders')
    ->hourly()
    ->onSuccess(fn () => Log::info('Booking reminders sent'))
    ->onFailure(fn () => Log::error('Failed to send reminders'));
```

**Command**: `App\Console\Commands\SendBookingReminders`

**Logic**:
1. Find bookings with `status = 'confirmed'`
2. Pickup time between 23-25 hours from now
3. Send reminder email to each customer
4. Log success/failure for each email

**Manual Execution**:

```bash
php artisan bookings:send-reminders
```

**Cron Setup (Production)**:

Add to crontab:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Testing Emails

### View Emails in Browser (Development)

Laravel uses `log` mailer by default. Emails are NOT actually sent, but logged to `storage/logs/laravel.log`.

**To test in browser**:

1. **Option 1: Use Mailtrap** (Recommended)

Add to `.env`:

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@autorental.vn
MAIL_FROM_NAME="Auto Rental Vietnam"
```

Sign up at: <https://mailtrap.io>

2. **Option 2: Use Laravel Telescope**

Install Telescope:

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

View emails at: `http://localhost:8000/telescope/mail`

3. **Option 3: Preview in Tinker**

```bash
php artisan tinker
```

```php
$booking = App\Models\Booking::with(['user', 'car.brand', 'car.category', 'pickupLocation', 'returnLocation', 'payments'])->find(1);
Mail::to('test@example.com')->send(new App\Mail\BookingConfirmation($booking));
```

### Test Booking Confirmation

**After successful PayPal payment**:
1. Complete a test booking with PayPal sandbox
2. Payment success → Email sent automatically
3. Check inbox (Mailtrap or configured email)
4. Verify all booking details are correct

### Test Booking Cancellation

1. Go to customer bookings page
2. Cancel a confirmed booking
3. Provide cancellation reason
4. Check inbox for cancellation email
5. Verify refund info is displayed

### Test Booking Reminder

**Manual trigger**:

```bash
php artisan bookings:send-reminders
```

**Automated test**:

1. Create a booking with pickup time exactly 24 hours from now
2. Wait for hourly cron to run (or manually trigger)
3. Check inbox for reminder email

---

## Production Setup

### Environment Variables

```bash
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com  # Or your SMTP provider
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@autorental.vn
MAIL_FROM_NAME="Auto Rental Vietnam"

# Queue Configuration
QUEUE_CONNECTION=database
```

### Gmail Setup (For Small Projects)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
3. Use in `.env` as `MAIL_PASSWORD`

### Professional Email Service (Recommended)

Use one of these for production:

**1. Amazon SES** (Cheap, scalable)
- $0.10 per 1000 emails
- Setup: <https://aws.amazon.com/ses/>

**2. SendGrid** (Easy to use)
- Free: 100 emails/day
- Setup: <https://sendgrid.com/>

**3. Mailgun** (Developer-friendly)
- Free: 5000 emails/month
- Setup: <https://www.mailgun.com/>

**4. Postmark** (Transactional focus)
- Free: 100 emails/month
- Setup: <https://postmarkapp.com/>

### Queue Worker with Supervisor

**Install Supervisor**:

```bash
sudo apt-get install supervisor
```

**Create config file**: `/etc/supervisor/conf.d/laravel-worker.conf`

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/autorental/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/autorental/storage/logs/worker.log
stopwaitsecs=3600
```

**Start Supervisor**:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

---

## Email Content Best Practices

### What We Did Right

✅ **Responsive Design**: Works on mobile and desktop
✅ **Plain Text Fallback**: All emails have text versions
✅ **Clear Hierarchy**: Important info is highlighted
✅ **Actionable CTAs**: Clear buttons for next steps
✅ **Brand Consistency**: Matches customer pages design
✅ **Contact Info**: Support email/phone in every email
✅ **Professional Tone**: Friendly but professional
✅ **Mobile-First**: Large touch targets, readable text

### Future Enhancements

- [ ] Add email tracking (opens, clicks)
- [ ] Personalized car recommendations in cancellation email
- [ ] Multi-language support (English/Vietnamese toggle)
- [ ] Email preferences (customer can opt-out of reminders)
- [ ] Owner notifications (when their car is booked)
- [ ] Payment receipt PDF attachments
- [ ] Review request email (after booking completion)

---

## Troubleshooting

### Emails Not Sending

1. **Check Queue Worker**:

```bash
php artisan queue:work
```

If no output, queue worker is not running.

2. **Check Failed Jobs**:

```bash
php artisan queue:failed
```

Retry failed jobs:

```bash
php artisan queue:retry all
```

3. **Check Logs**:

```bash
tail -f storage/logs/laravel.log
```

Look for mail errors.

4. **Test SMTP Connection**:

```bash
php artisan tinker
```

```php
Mail::raw('Test email', function ($message) {
    $message->to('test@example.com')->subject('Test');
});
```

### Email Looks Broken

**Issue**: Email HTML not rendering correctly

**Solution**:
- Use inline CSS (already done in layout)
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Use <https://www.emailonacid.com/> for cross-client testing
- Check `resources/views/emails/layout.blade.php` for CSS

### Queue Worker Stops

**Issue**: Queue worker crashes or stops processing

**Solution**:
- Use Supervisor (see production setup above)
- Check for memory leaks: `--max-time=3600` flag
- Monitor logs: `storage/logs/worker.log`
- Restart: `sudo supervisorctl restart laravel-worker:*`

---

## Summary

**Files Created** (11 total):

1. `app/Mail/BookingConfirmation.php`
2. `app/Mail/BookingCancelled.php`
3. `app/Mail/BookingReminder.php`
4. `app/Console/Commands/SendBookingReminders.php`
5. `resources/views/emails/layout.blade.php`
6. `resources/views/emails/booking-confirmation.blade.php`
7. `resources/views/emails/booking-confirmation-text.blade.php`
8. `resources/views/emails/booking-cancelled.blade.php`
9. `resources/views/emails/booking-cancelled-text.blade.php`
10. `resources/views/emails/booking-reminder.blade.php`
11. `resources/views/emails/booking-reminder-text.blade.php`

**Files Modified** (3 total):

1. `app/Http/Controllers/PaymentController.php` (added BookingConfirmation email)
2. `app/Http/Controllers/Customer/BookingController.php` (added BookingCancelled email)
3. `routes/console.php` (added reminder schedule)

**Ready for Production**: ✅

- Queue system configured
- Emails are queued (non-blocking)
- Scheduled reminders set up
- Professional email templates
- Mobile-responsive design
- Plain text fallbacks included
