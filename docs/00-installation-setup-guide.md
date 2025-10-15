# Installation & Setup Guide - AutoRental App

Complete step-by-step guide to set up the AutoRental car rental platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2 or higher** ([Download](https://www.php.net/downloads))
- **Composer** - PHP dependency manager ([Download](https://getcomposer.org/download/))
- **Node.js 18+ and npm** - JavaScript runtime ([Download](https://nodejs.org/))
- **SQLite** - Database (usually included with PHP)
- **Git** - Version control ([Download](https://git-scm.com/downloads))

### Optional but Recommended
- **VS Code** with extensions: PHP Intelephense, ESLint, Prettier
- **Postman** or similar for API testing

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yurivolkov21/Auto-Rental-Demo.git
cd Auto-Rental-Demo
```

### 2. Install PHP Dependencies

```bash
composer install
```

This will install all Laravel packages and dependencies defined in `composer.json`.

### 3. Install JavaScript Dependencies

```bash
npm install
```

This will install React, Inertia.js, TypeScript, and all frontend dependencies.

### 4. Environment Configuration

#### 4.1. Create Environment File

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### 4.2. Generate Application Key

```bash
php artisan key:generate
```

#### 4.3. Configure Database

The project uses **SQLite** by default (zero configuration). The `.env` file is already configured:

```env
DB_CONNECTION=sqlite
```

For **MySQL/PostgreSQL** (optional), update `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auto_rental
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### 4.4. Configure OAuth & Payment (Optional)

**Google OAuth** (for social login):
1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Update in `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost/auth/google/callback
```

**PayPal** (for payments):
1. Get sandbox credentials from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications)
2. Update in `.env`:
```env
PAYPAL_MODE=sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_secret
```

**Currency Configuration**:
```env
APP_CURRENCY=VND
VND_TO_USD_RATE=26000
USE_FIXED_EXCHANGE_RATE=true
```

### 5. Database Setup

#### 5.1. Create Database File (SQLite)

```bash
# Windows PowerShell
New-Item -Path database/database.sqlite -ItemType File

# Linux/Mac
touch database/database.sqlite
```

#### 5.2. Run Migrations

```bash
php artisan migrate
```

This creates all database tables (users, cars, bookings, payments, etc.).

#### 5.3. Seed Sample Data

```bash
php artisan db:seed
```

This will create:
- 3 test users (customer, owner, admin)
- Car brands, categories, locations
- Sample cars with images
- Sample bookings and reviews
- Promotions and drivers

**Default Test Accounts:**

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Customer | customer@example.com   | password   |
| Owner    | owner@example.com      | password   |
| Admin    | admin@example.com      | password   |

### 6. Storage Setup

Create symbolic link for public file access:

```bash
php artisan storage:link
```

This links `storage/app/public` to `public/storage` for car images and user uploads.

### 7. Run the Application

#### Development Mode (Recommended)

**Option A: Using Composer Script (Recommended)**
```bash
composer dev
```

This runs Laravel server + Queue worker + Vite dev server in parallel.

**Option B: Manual (3 separate terminals)**

Terminal 1 - Laravel Server:
```bash
php artisan serve
```

Terminal 2 - Queue Worker (for async jobs):
```bash
php artisan queue:work
```

Terminal 3 - Vite Dev Server (for React hot reload):
```bash
npm run dev
```

#### Production Build

```bash
npm run build
php artisan serve
```

### 8. Access the Application

Open your browser and navigate to:

- **Frontend**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Health**: http://localhost:8000/up

## Verification Checklist

After setup, verify everything works:

- [ ] Homepage loads with car listings
- [ ] User registration/login works
- [ ] Admin login (admin@example.com / password)
- [ ] Car search and filtering works
- [ ] Booking flow completes
- [ ] Images display correctly

## Testing

### Run All Tests

```bash
composer test
```

This runs the full Pest test suite (Feature + Unit tests) using SQLite in-memory database.

### Frontend Validation

```bash
npm run types    # TypeScript type checking
npm run lint     # ESLint code quality
```

### Code Formatting

```bash
npm run format   # Format React/TypeScript code
```

## Common Issues & Solutions

### Issue 1: "Class not found" errors
**Solution**: Regenerate autoload files
```bash
composer dump-autoload
```

### Issue 2: Permission denied (storage/logs)
**Solution**: Fix directory permissions
```bash
# Windows (run as Administrator)
icacls storage /grant Everyone:(OI)(CI)F /T
icacls bootstrap/cache /grant Everyone:(OI)(CI)F /T

# Linux/Mac
chmod -R 775 storage bootstrap/cache
```

### Issue 3: Vite not connecting (HMR issues)
**Solution**: Clear Vite cache
```bash
rm -rf node_modules/.vite
npm run dev
```

### Issue 4: Database locked (SQLite)
**Solution**: Close all database connections or delete `database/database.sqlite` and re-run migrations

### Issue 5: Missing car images
**Solution**: Re-run storage link
```bash
php artisan storage:link
```

## Project Structure Overview

```
Auto-Rental-Demo/
├── app/
│   ├── Http/Controllers/     # Laravel controllers
│   ├── Models/               # Eloquent models (Car, Booking, User, etc.)
│   └── Services/             # Business logic (Pricing, PayPal, Currency)
├── database/
│   ├── migrations/           # Database schema (source of truth)
│   ├── factories/            # Fake data generators
│   └── seeders/              # Test data creators
├── resources/
│   └── js/
│       ├── components/       # React components (shadcn/ui)
│       ├── pages/            # Inertia pages (customer, admin)
│       └── types/            # TypeScript interfaces
├── routes/
│   ├── web.php              # Public routes
│   ├── auth.php             # Authentication routes
│   ├── settings.php         # User settings routes
│   └── admin.php            # Admin panel routes
└── tests/
    ├── Feature/             # Integration tests
    └── Unit/                # Unit tests
```

## Development Workflow

### Making Schema Changes

When adding/modifying database fields, update these 6 places:

1. **Migration** (`database/migrations/*`)
2. **Model** `$fillable` + `$casts` (`app/Models/*.php`)
3. **Factory** (`database/factories/*Factory.php`)
4. **Seeder** (`database/seeders/DatabaseSeeder.php`)
5. **Controller** validation rules
6. **TypeScript types** (`resources/js/types/models/*.ts`)

### Code Quality Standards

Before committing:

```bash
composer test           # Backend tests pass
npm run types          # TypeScript types valid
npm run lint           # ESLint passes
```

## Deployment Preparation

### Build Production Assets

```bash
npm run build
```

### Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables

Update `.env` for production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
DB_CONNECTION=mysql  # Use MySQL/PostgreSQL in production
PAYPAL_MODE=live     # Switch to live PayPal
```

## Additional Resources

- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://react.dev
- **Inertia.js Guide**: https://inertiajs.com
- **shadcn/ui Components**: https://ui.shadcn.com
- **PayPal Integration**: https://developer.paypal.com/docs

## Support

If you encounter issues:

1. Check this guide's "Common Issues" section
2. Review error logs in `storage/logs/laravel.log`
3. Verify all prerequisites are installed correctly
4. Ensure `.env` configuration is correct

## Next Steps

After successful setup:

1. **Explore the codebase**: Read `docs/01-customer-pages-development-plan.md`
2. **Customize settings**: Update app name, currency, branding
3. **Add your cars**: Use admin panel to manage inventory
4. **Configure payments**: Set up live PayPal credentials
5. **Deploy**: Follow deployment preparation steps above

---

**Note**: This is a development setup guide. For production deployment, additional security and performance configurations are required (HTTPS, CDN, caching, monitoring, backups, etc.).
