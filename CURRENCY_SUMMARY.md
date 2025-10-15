# 💱 Giải Pháp Currency Conversion - Tóm Tắt

## ❓ Vấn Đề

- Website sử dụng **VND** (đồng Việt Nam) để hiển thị giá
- PayPal yêu cầu **USD** (đô la Mỹ) cho thanh toán quốc tế
- Cần convert chính xác mà không mất dữ liệu

---

## ✅ Giải Pháp Đã Implement

### 📦 **CurrencyService** - Service chuyển đổi tiền tệ

**File:** `app/Services/CurrencyService.php`

**Tính năng:**
- ✅ Convert VND → USD
- ✅ Convert USD → VND  
- ✅ Get exchange rate (cached 1 giờ)
- ✅ Format tiền tệ đẹp (5.000.000 ₫, $204.08)
- ✅ Hỗ trợ fixed rate hoặc API rate
- ✅ Fallback safety nếu API fail

**Cách dùng:**
```php
$currencyService = app(CurrencyService::class);

// Convert
$usd = $currencyService->vndToUsd(5000000); // 204.08
$vnd = $currencyService->usdToVnd(100);     // 2,450,000

// Format
$formatted = $currencyService->format(5000000, 'VND'); // "5.000.000 ₫"

// Get full details
$details = $currencyService->getConversionDetails(5000000);
// ['amount_vnd' => 5000000, 'amount_usd' => 204.08, ...]
```

---

## ⚙️ Cấu Hình

### **1. Config Files**

**`config/app.php`** - Đã thêm:
```php
'currency' => env('APP_CURRENCY', 'VND'),
'vnd_to_usd_rate' => env('VND_TO_USD_RATE', 24500),
'use_fixed_exchange_rate' => env('USE_FIXED_EXCHANGE_RATE', true),
```

**`.env.example`** - Đã thêm:
```env
APP_CURRENCY=VND
VND_TO_USD_RATE=24500
USE_FIXED_EXCHANGE_RATE=true
```

### **2. Exchange Rate Options**

**Option A: Fixed Rate (Hiện tại - Đơn giản)**
```env
USE_FIXED_EXCHANGE_RATE=true
VND_TO_USD_RATE=24500  # 1 USD = 24,500 VND
```

**Option B: API Rate (Tương lai - Dynamic)**
```env
USE_FIXED_EXCHANGE_RATE=false
# Sẽ fetch từ exchangerate-api.com
```

---

## 🔄 Flow Thanh Toán PayPal

### **Quy trình:**

```
1. Customer xem giá: 5.000.000 ₫ (VND)
       ↓
2. Click "Pay with PayPal"
       ↓
3. Backend convert: 5.000.000 VND → $204.08 USD
       ↓
4. Send to PayPal: $204.08 USD
       ↓
5. Customer pay: $204.08 USD
       ↓
6. Store in DB:
   - amount: 5,000,000 (VND - original)
   - currency: VND
   - notes: "Paid $204.08 USD via PayPal. Rate: 1 USD = 24,500 VND"
```

### **Code Example:**

```php
use App\Services\CurrencyService;
use App\Services\PayPalService;

// Get booking amount in VND
$amountVND = $booking->charge->total_amount; // 5,000,000 VND

// Convert to USD
$currencyService = app(CurrencyService::class);
$conversion = $currencyService->getConversionDetails($amountVND);

// Create PayPal order in USD
$paypalService = app(PayPalService::class);
$order = $paypalService->createOrder(
    $booking,
    $conversion['amount_usd'], // 204.08
    'deposit'
);

// Store payment with VND (original)
Payment::create([
    'amount' => $amountVND,     // 5,000,000 (VND)
    'currency' => 'VND',
    'notes' => "Paid {$conversion['formatted_usd']} USD. Rate: {$conversion['rate_text']}"
]);
```

---

## 📊 Database Schema

### **Cách Hiện Tại (Simple):**

```sql
payments table:
- amount (decimal 10,2)      -- Store VND amount
- currency (varchar)         -- 'VND'
- notes (text)               -- Include USD info: "Paid $204.08 USD..."
```

**Ưu điểm:**
✅ Không cần thay đổi schema
✅ VND là source of truth
✅ Đơn giản, dễ implement

**Nhược điểm:**
❌ USD amount trong notes (không query được)
❌ Phải recalculate USD cho reports

---

### **Cách Tương Lai (Advanced - Nếu cần):**

```sql
payments table:
- amount (decimal 10,2)           -- Deprecated (backward compat)
- amount_vnd (decimal 12,2)       -- Primary amount in VND
- amount_usd (decimal 10,2)       -- Exact USD paid to PayPal
- exchange_rate (decimal 10,4)    -- Rate at payment time
- currency (varchar)              -- 'VND'
```

**Ưu điểm:**
✅ Lưu chính xác cả 2 currencies
✅ Có thể query/report theo USD
✅ Audit trail đầy đủ
✅ Biết chính xác exchange rate tại thời điểm thanh toán

**Nhược điểm:**
❌ Cần migration
❌ Update nhiều code hơn

---

## 🎯 Recommendation

### **Hiện Tại (MVP/Testing):**
✅ **Dùng CurrencyService + Simple Schema**
- Store VND trong database
- Convert runtime khi cần
- Put USD info trong notes
- Fixed exchange rate

### **Tương Lai (Production):**
💡 **Nâng cấp lên Dual Currency nếu cần:**
- Khi cần reports chi tiết theo USD
- Khi exchange rate thay đổi nhiều
- Khi cần audit chính xác

---

## 📝 Checklist Implementation

### ✅ Đã Hoàn Thành:

- ✅ Tạo `CurrencyService`
- ✅ Config `app.php` với currency settings
- ✅ Update `.env.example` với currency vars
- ✅ Tạo example usage file

### 🔜 Cần Làm Khi Implement Customer Payment:

1. **PayPalService Integration:**
   ```php
   // Update PayPalService::createOrder()
   $conversion = app(CurrencyService::class)->getConversionDetails($amountVND);
   // Send $conversion['amount_usd'] to PayPal
   ```

2. **Frontend Display:**
   ```tsx
   // Show both currencies
   <p>Amount: 5.000.000 ₫</p>
   <p className="text-sm">≈ $204.08 USD</p>
   ```

3. **Admin Panel:**
   - Hiển thị VND (primary)
   - Show USD trong tooltip/notes
   - Display current exchange rate

---

## 🧪 Testing

### **Test CurrencyService:**

```bash
php artisan tinker
```

```php
$service = app(\App\Services\CurrencyService::class);

// Test conversion
$service->vndToUsd(5000000);  // Should return ~204.08
$service->usdToVnd(100);      // Should return 2450000

// Test formatting
$service->format(5000000, 'VND'); // "5.000.000 ₫"
$service->format(204.08, 'USD');  // "$204.08"

// Test full details
$service->getConversionDetails(5000000);
```

### **Update Exchange Rate:**

```bash
# Edit .env
VND_TO_USD_RATE=25000  # Change rate

# Clear cache
php artisan cache:clear

# Test again
```

---

## 📚 Files Created/Modified

### ✅ New Files:
- `app/Services/CurrencyService.php` - Currency conversion service
- `CURRENCY_CONVERSION_GUIDE.md` - Full documentation
- `CURRENCY_SERVICE_EXAMPLES.php` - Usage examples
- `CURRENCY_SUMMARY.md` - This file

### ✅ Modified Files:
- `config/app.php` - Added currency config
- `.env.example` - Added currency environment variables

---

## 🚀 Ready to Use!

CurrencyService đã sẵn sàng sử dụng ngay:

```php
// Anywhere in your code
$currencyService = app(\App\Services\CurrencyService::class);

// Convert VND to USD for PayPal
$usd = $currencyService->vndToUsd($amountVND);

// Format for display
$formatted = $currencyService->format($amount, 'VND');
```

**Không cần migration!** Service hoạt động với schema hiện tại.

---

## 💡 Tips

1. **Update rate định kỳ:**
   - Check tỷ giá thực tế tại Vietcombank/BIDV
   - Update `VND_TO_USD_RATE` trong .env
   - Run `php artisan cache:clear`

2. **Hiển thị cho user:**
   ```
   Total: 5.000.000 ₫
   PayPal: ≈ $204.08 USD
   (Rate: 1 USD = 24,500 VND)
   ```

3. **Testing:**
   - Test với different rates
   - Verify rounding (2 decimals USD)
   - Check format display

---

**Status:** ✅ Ready for Integration  
**Next:** Integrate vào PayPal payment flow khi implement customer side
