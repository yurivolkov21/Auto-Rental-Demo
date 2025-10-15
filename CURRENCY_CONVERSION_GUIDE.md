# Currency Conversion Solutions for Auto-Rental

## Problem
- Website uses **VND** (Vietnam Dong) for pricing
- PayPal requires **USD** (US Dollar) for international payments
- Need accurate conversion without data loss

---

## 🎯 Solution 1: Dual Currency Storage (RECOMMENDED)

### Overview
Store both VND and USD amounts in the database, along with the exchange rate at the time of payment.

### Implementation Steps

#### 1. Create New Migration
```bash
php artisan make:migration add_currency_fields_to_payments_table
```

Add these fields to `payments` table:
- `amount_vnd` (decimal 12,2) - Amount in VND
- `amount_usd` (decimal 10,2) - Amount in USD  
- `exchange_rate` (decimal 10,4) - Exchange rate at payment time (VND per 1 USD)

#### 2. Update Payment Model
```php
protected $fillable = [
    // ... existing fields
    'amount',           // Keep for backward compatibility
    'amount_vnd',       // Primary amount in VND
    'amount_usd',       // Converted amount in USD
    'exchange_rate',    // Rate used for conversion
    'currency',         // Primary currency (VND)
];

protected $casts = [
    'amount' => 'decimal:2',
    'amount_vnd' => 'decimal:2',
    'amount_usd' => 'decimal:2',
    'exchange_rate' => 'decimal:4',
];
```

#### 3. Create Currency Service
Helper to convert VND ↔ USD using live rates or fixed config.

#### 4. Configuration (.env)
```env
# Primary currency for website
APP_CURRENCY=VND

# Fixed exchange rate (or use API)
VND_TO_USD_RATE=24500  # 1 USD = 24,500 VND (example)

# PayPal currency
PAYPAL_CURRENCY=USD
```

### Advantages
✅ **Accurate audit trail** - Know exact amounts at payment time  
✅ **No data loss** - Both currencies preserved  
✅ **Historical rates** - Track exchange rate changes  
✅ **Flexible reporting** - Can report in either currency  
✅ **PayPal compliance** - Send exact USD amount  

### Disadvantages
❌ More database fields  
❌ Slightly more complex logic  

---

## 🎯 Solution 2: Single Currency with Runtime Conversion (SIMPLER)

### Overview
Store amount in VND only, convert to USD when sending to PayPal.

### Implementation

#### 1. Keep Current Schema
No migration changes needed. Use existing `amount` and `currency` fields.

#### 2. Configuration
```env
APP_CURRENCY=VND
PAYPAL_CURRENCY=USD
VND_TO_USD_RATE=24500
```

#### 3. Convert at Payment Time
```php
// In PayPalService
$amountVND = $booking->charge->total_amount;
$amountUSD = $amountVND / config('app.vnd_to_usd_rate');

// Send to PayPal
'amount' => [
    'currency_code' => 'USD',
    'value' => number_format($amountUSD, 2, '.', ''),
]

// Store payment
Payment::create([
    'amount' => $amountVND,  // Store original VND
    'currency' => 'VND',
    'notes' => "Paid $" . number_format($amountUSD, 2) . " USD via PayPal"
]);
```

### Advantages
✅ **Simple** - No schema changes  
✅ **Less code** - No dual tracking  
✅ **Clear primary currency** - VND is source of truth  

### Disadvantages
❌ Need to recalculate USD for reports  
❌ Can't track exact USD amount paid  
❌ Exchange rate fluctuations not recorded  

---

## 📊 Comparison

| Feature | Solution 1 (Dual) | Solution 2 (Single) |
|---------|------------------|---------------------|
| Complexity | Medium | Low |
| Accuracy | High | Medium |
| Audit Trail | Excellent | Good |
| Database Size | +3 fields | No change |
| Reporting | Both currencies | VND only |
| PayPal Integration | Exact match | Calculated |
| **Recommended for** | **Production** | **MVP/Testing** |

---

## 🎯 RECOMMENDATION

For Vietnam car rental business handling international payments:

**Use Solution 1 (Dual Currency)** because:
1. ✅ Accurate financial records for accounting
2. ✅ Can prove exact PayPal charges
3. ✅ Better for customer disputes
4. ✅ Compliant with tax/audit requirements
5. ✅ Professional financial tracking

---

## 🔧 Quick Implementation (Solution 1)

### Step 1: Migration
```bash
php artisan make:migration add_currency_fields_to_payments_table
```

### Step 2: Add to Migration File
```php
public function up(): void
{
    Schema::table('payments', function (Blueprint $table) {
        $table->decimal('amount_vnd', 12, 2)->after('amount')->nullable();
        $table->decimal('amount_usd', 10, 2)->after('amount_vnd')->nullable();
        $table->decimal('exchange_rate', 10, 4)->after('amount_usd')->nullable();
    });
}
```

### Step 3: Update Existing Data
```php
// After migration, update existing records
DB::table('payments')->update([
    'amount_vnd' => DB::raw('amount'),
    'currency' => 'VND'
]);
```

### Step 4: Configure Exchange Rate
```env
# .env
APP_CURRENCY=VND
VND_TO_USD_RATE=24500
PAYPAL_CURRENCY=USD
```

---

## 📝 Exchange Rate Options

### Option A: Fixed Rate (Simple)
```php
// config/app.php
'vnd_to_usd_rate' => env('VND_TO_USD_RATE', 24500),
```

### Option B: API Integration (Dynamic)
Use services like:
- Exchange Rate API (https://www.exchangerate-api.com/)
- Open Exchange Rates (https://openexchangerates.org/)
- xe.com API

### Option C: Manual Admin Update
Create admin setting to update rate daily/weekly.

---

## 🚀 Next Steps

Choose your solution and I'll help implement:

1. **Solution 1 (Dual)**: Full implementation with migration
2. **Solution 2 (Single)**: Simple config-based conversion
3. **Custom**: Mix of both approaches

Let me know which direction you prefer!
