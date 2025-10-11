<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Location;
use Illuminate\Database\Seeder;
use App\Models\UserVerification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ============================================
        // STEP 1: Create Static/Master Data (Locations)
        // ============================================
        $this->seedLocations();

        // ============================================
        // STEP 2: Create Users with Roles
        // ============================================

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'laravel.carbook.app@gmail.com'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('P@ssword123'),
                'email_verified_at' => now(),
                'role'              => 'admin',
                'status'            => 'active',
                'phone'             => '+84937699061',
            ]
        );

        // Create test customer
        $customer = User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'              => 'Customer User',
                'password'          => Hash::make('P@ssword123'),
                'email_verified_at' => now(),
                'role'              => 'customer',
                'status'            => 'active',
                'phone'             => '+84912345678',
                'address'           => '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
                'date_of_birth'     => '1990-01-15',
            ]
        );

        // Create verified customer with verification
        UserVerification::firstOrCreate(
            ['user_id' => $customer->id],
            [
                'driving_license_number' => 'B1234567',
                'license_type'           => 'B2',
                'license_issue_date'     => '2020-01-01',
                'license_expiry_date'    => '2030-01-01',
                'license_issued_country' => 'Vietnam',
                'nationality'            => 'Vietnamese',
                'status'                 => 'verified',
                'verified_by'            => $admin->id,
                'verified_at'            => now(),
            ]
        );

        // Create test car owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name'              => 'Car Owner',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'role'              => 'owner',
                'status'            => 'active',
                'phone'             => '+84923456789',
                'address'           => '456 Le Loi Street, District 3, Ho Chi Minh City',
            ]
        );

        // Create additional test users (50 customers, 20 owners)
        User::factory()->count(50)->customer()->create();
        User::factory()->count(20)->owner()->create();

        // Create some pending verifications
        $pendingUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(20)
            ->get();

        foreach ($pendingUsers as $user) {
            UserVerification::factory()->pending()->create(['user_id' => $user->id]);
        }

        // Create some verified verifications
        $verifiedUsers = User::where('role', 'customer')
            ->whereDoesntHave('verification')
            ->take(30)
            ->get();

        foreach ($verifiedUsers as $user) {
            UserVerification::factory()->verified()->create(['user_id' => $user->id]);
        }
    }

    /**
     * Seed locations data - Southern Vietnam only.
     */
    protected function seedLocations(): void
    {
        // Major airport location in Southern Vietnam
        $airportLocation = [
            'name'         => 'Tan Son Nhat Airport - Ho Chi Minh City',
            'slug'         => 'tan-son-nhat-airport-hcmc',
            'description'  => 'Main rental location at Tan Son Nhat International Airport, Vietnam\'s busiest airport. Convenient pick-up and drop-off service available 24/7.',
            'address'      => 'Tan Son Nhat International Airport, Truong Son Street, Tan Binh District',
            'latitude'     => 10.8188,
            'longitude'    => 106.6519,
            'phone'        => '+84283848484',
            'email'        => 'tansonnhat@autorental.vn',
            'is_24_7'      => true,
            'is_airport'   => true,
            'is_popular'   => true,
            'is_active'    => true,
            'sort_order'   => 1,
        ];

        Location::firstOrCreate(
            ['slug' => $airportLocation['slug']],
            $airportLocation
        );

        // Popular city center locations in Southern Vietnam
        $cityLocations = [
            [
                'name'         => 'District 1 Downtown - Ho Chi Minh City',
                'slug'         => 'district-1-downtown-hcmc',
                'description'  => 'Prime location in the heart of Ho Chi Minh City, near Ben Thanh Market and major hotels. Easy access to all districts.',
                'address'      => '123 Nguyen Hue Street, Ben Nghe Ward, District 1',
                'latitude'     => 10.7756,
                'longitude'    => 106.7019,
                'phone'        => '+84283123456',
                'email'        => 'district1@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '20:00:00',
                'is_airport'   => false,
                'is_popular'   => true,
                'is_active'    => true,
                'sort_order'   => 10,
            ],
            [
                'name'         => 'District 7 - Phu My Hung',
                'slug'         => 'district-7-phu-my-hung-hcmc',
                'description'  => 'Modern business district location, ideal for expats and business travelers. Near Crescent Mall and international schools.',
                'address'      => '456 Nguyen Van Linh Boulevard, Tan Phong Ward, District 7',
                'latitude'     => 10.7412,
                'longitude'    => 106.7197,
                'phone'        => '+84283234567',
                'email'        => 'district7@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '19:00:00',
                'is_airport'   => false,
                'is_popular'   => true,
                'is_active'    => true,
                'sort_order'   => 11,
            ],
            [
                'name'         => 'Vung Tau Beach Front',
                'slug'         => 'vung-tau-beach-front',
                'description'  => 'Coastal location in Vung Tau, perfect for beach getaways and weekend trips from Ho Chi Minh City.',
                'address'      => '88 Tran Phu Street, Ward 1',
                'latitude'     => 10.3415,
                'longitude'    => 107.0843,
                'phone'        => '+84254888999',
                'email'        => 'vungtau@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'is_airport'   => false,
                'is_popular'   => true,
                'is_active'    => true,
                'sort_order'   => 12,
            ],
            [
                'name'         => 'Can Tho City Center',
                'slug'         => 'can-tho-city-center',
                'description'  => 'Gateway to Mekong Delta region. Perfect for exploring floating markets and river life.',
                'address'      => '23 Hai Ba Trung Street, Tan An Ward, Ninh Kieu District',
                'latitude'     => 10.0341,
                'longitude'    => 105.7851,
                'phone'        => '+84292567890',
                'email'        => 'cantho@autorental.vn',
                'opening_time' => '07:30:00',
                'closing_time' => '19:00:00',
                'is_airport'   => false,
                'is_popular'   => true,
                'is_active'    => true,
                'sort_order'   => 13,
            ],
            [
                'name'         => 'Phu Quoc Island - Duong Dong',
                'slug'         => 'phu-quoc-duong-dong',
                'description'  => 'Main town location in Phu Quoc Island, Vietnam\'s paradise island. Perfect for beach hopping and island exploration.',
                'address'      => '67 Tran Hung Dao Street, Duong Dong Town',
                'latitude'     => 10.2216,
                'longitude'    => 103.9669,
                'phone'        => '+84297654321',
                'email'        => 'phuquoc@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'is_airport'   => false,
                'is_popular'   => true,
                'is_active'    => true,
                'sort_order'   => 14,
            ],
            [
                'name'         => 'Rach Gia - Kien Giang',
                'slug'         => 'rach-gia-kien-giang',
                'description'  => 'Coastal city location, gateway to Phu Quoc and Nam Du islands. Ideal for island-hopping adventures.',
                'address'      => '45 Le Loi Street, Vinh Thanh Van Ward',
                'latitude'     => 10.0156,
                'longitude'    => 105.0742,
                'phone'        => '+84297777888',
                'email'        => 'rachgia@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '18:00:00',
                'is_airport'   => false,
                'is_popular'   => false,
                'is_active'    => true,
                'sort_order'   => 20,
            ],
            [
                'name'         => 'My Tho - Tien Giang',
                'slug'         => 'my-tho-tien-giang',
                'description'  => 'Northern Mekong Delta location, perfect for exploring river tours and local culture.',
                'address'      => '12 30 Thang 4 Street, Ward 1',
                'latitude'     => 10.3524,
                'longitude'    => 106.3483,
                'phone'        => '+84273999000',
                'email'        => 'mytho@autorental.vn',
                'opening_time' => '08:00:00',
                'closing_time' => '17:30:00',
                'is_airport'   => false,
                'is_popular'   => false,
                'is_active'    => true,
                'sort_order'   => 21,
            ],
        ];

        foreach ($cityLocations as $location) {
            Location::firstOrCreate(
                ['slug' => $location['slug']],
                $location
            );
        }

        // Generate additional random locations in Southern Vietnam (20 more)
        Location::factory()->count(10)->popular()->create();
        Location::factory()->count(10)->active()->create();
    }
}
