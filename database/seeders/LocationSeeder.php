<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📍 Starting location seeding...');
        $this->command->newLine();

        // Define 10 locations in Southern Vietnam
        $locations = [
            // TP. Hồ Chí Minh (5 locations - main hub)
            [
                'name'          => 'Sân bay Tân Sơn Nhất',
                'slug'          => 'san-bay-tan-son-nhat',
                'description'   => 'Chi nhánh tại sân bay quốc tế Tân Sơn Nhất, phục vụ 24/7 cho khách đi và đến TP.HCM. Thủ tục nhanh gọn, nhận xe ngay tại sảnh đến.',
                'address'       => 'Sân bay Tân Sơn Nhất, Trường Sơn, Phường 2, Tân Bình, TP. Hồ Chí Minh',
                'latitude'      => 10.8188,
                'longitude'     => 106.6519,
                'phone'         => '+842838484848',
                'email'         => 'tansonnhat@autorental.vn',
                'opening_time'  => null,
                'closing_time'  => null,
                'is_24_7'       => true,
                'is_airport'    => true,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 1,
            ],
            [
                'name'          => 'Quận 1 - Trung tâm TP.HCM',
                'slug'          => 'quan-1-trung-tam-tp-hcm',
                'description'   => 'Chi nhánh trung tâm Quận 1, gần Nhà hát thành phố, Bến Thành Market. Vị trí đắc địa, thuận tiện cho khách du lịch và công tác.',
                'address'       => '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
                'latitude'      => 10.7769,
                'longitude'     => 106.7009,
                'phone'         => '+842838123456',
                'email'         => 'quan1@autorental.vn',
                'opening_time'  => '07:00:00',
                'closing_time'  => '22:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 2,
            ],
            [
                'name'          => 'Quận 7 - Phú Mỹ Hưng',
                'slug'          => 'quan-7-phu-my-hung',
                'description'   => 'Chi nhánh tại khu đô thị Phú Mỹ Hưng, phục vụ cộng đồng người nước ngoài và khu vực Nam Sài Gòn. Đội ngũ nhân viên thông thạo tiếng Anh.',
                'address'       => '45 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh',
                'latitude'      => 10.7411,
                'longitude'     => 106.7198,
                'phone'         => '+842854567890',
                'email'         => 'quan7@autorental.vn',
                'opening_time'  => '08:00:00',
                'closing_time'  => '20:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => false,
                'is_active'     => true,
                'sort_order'    => 3,
            ],
            [
                'name'          => 'Quận Thủ Đức - Khu Công nghệ cao',
                'slug'          => 'quan-thu-duc-khu-cong-nghe-cao',
                'description'   => 'Chi nhánh tại Khu Công nghệ cao TP.HCM, gần các trường đại học và khu đô thị mới. Phục vụ khách công tác và sinh viên quốc tế.',
                'address'       => '789 Xa Lộ Hà Nội, Phường Linh Trung, Thủ Đức, TP. Hồ Chí Minh',
                'latitude'      => 10.8708,
                'longitude'     => 106.8034,
                'phone'         => '+842837778888',
                'email'         => 'thuduc@autorental.vn',
                'opening_time'  => '08:00:00',
                'closing_time'  => '19:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => false,
                'is_active'     => true,
                'sort_order'    => 4,
            ],
            [
                'name'          => 'Bến xe Miền Đông',
                'slug'          => 'ben-xe-mien-dong',
                'description'   => 'Chi nhánh tại bến xe Miền Đông mới, phục vụ khách đi tour miền Đông Nam Bộ và Tây Nguyên. Thuận tiện cho các chuyến đi đường dài.',
                'address'       => 'Bến xe Miền Đông, Quốc lộ 13, Phường Hiệp Bình Phước, Thủ Đức, TP. Hồ Chí Minh',
                'latitude'      => 10.8951,
                'longitude'     => 106.7925,
                'phone'         => '+842838889999',
                'email'         => 'miendong@autorental.vn',
                'opening_time'  => '06:00:00',
                'closing_time'  => '21:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => false,
                'is_active'     => true,
                'sort_order'    => 5,
            ],

            // Vũng Tàu (1 location - beach city)
            [
                'name'          => 'Vũng Tàu - Thùy Vân',
                'slug'          => 'vung-tau-thuy-van',
                'description'   => 'Chi nhánh tại Vũng Tàu, gần bãi biển Thùy Vân. Điểm đến lý tưởng cho khách du lịch nghỉ dưỡng cuối tuần từ TP.HCM.',
                'address'       => '234 Đường Thùy Vân, Phường Thắng Tam, Vũng Tàu, Bà Rịa - Vũng Tàu',
                'latitude'      => 10.3460,
                'longitude'     => 107.0843,
                'phone'         => '+842543567890',
                'email'         => 'vungtau@autorental.vn',
                'opening_time'  => '07:00:00',
                'closing_time'  => '21:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 6,
            ],

            // Cần Thơ (2 locations - Mekong Delta hub)
            [
                'name'          => 'Sân bay Cần Thơ',
                'slug'          => 'san-bay-can-tho',
                'description'   => 'Chi nhánh tại sân bay quốc tế Cần Thơ, cửa ngõ du lịch miền Tây. Phục vụ 24/7, hỗ trợ khách khám phá đồng bằng sông Cửu Long.',
                'address'       => 'Sân bay Quốc tế Cần Thơ, Đường Nguyễn Văn Cừ, Phường Hưng Lợi, Ninh Kiều, Cần Thơ',
                'latitude'      => 10.0851,
                'longitude'     => 105.7119,
                'phone'         => '+842923456789',
                'email'         => 'canthoairport@autorental.vn',
                'opening_time'  => null,
                'closing_time'  => null,
                'is_24_7'       => true,
                'is_airport'    => true,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 7,
            ],
            [
                'name'          => 'Cần Thơ - Ninh Kiều',
                'slug'          => 'can-tho-ninh-kieu',
                'description'   => 'Chi nhánh trung tâm Cần Thơ, gần bến Ninh Kiều và chợ nổi Cái Răng. Thuận tiện cho khách du lịch khám phá miền Tây.',
                'address'       => '56 Đường Hai Bà Trưng, Phường Tân An, Ninh Kiều, Cần Thơ',
                'latitude'      => 10.0342,
                'longitude'     => 105.7881,
                'phone'         => '+842923567890',
                'email'         => 'cantho@autorental.vn',
                'opening_time'  => '07:00:00',
                'closing_time'  => '20:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => false,
                'is_active'     => true,
                'sort_order'    => 8,
            ],

            // Đà Lạt (1 location - highland resort)
            [
                'name'          => 'Đà Lạt - Trung tâm',
                'slug'          => 'da-lat-trung-tam',
                'description'   => 'Chi nhánh tại trung tâm Đà Lạt, gần hồ Xuân Hương và chợ Đà Lạt. Điểm xuất phát lý tưởng cho các chuyến khám phá cao nguyên.',
                'address'       => '78 Đường Trần Phú, Phường 4, Đà Lạt, Lâm Đồng',
                'latitude'      => 11.9404,
                'longitude'     => 108.4583,
                'phone'         => '+842633456789',
                'email'         => 'dalat@autorental.vn',
                'opening_time'  => '07:00:00',
                'closing_time'  => '20:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 9,
            ],

            // Phan Thiết (1 location - beach resort)
            [
                'name'          => 'Phan Thiết - Mũi Né',
                'slug'          => 'phan-thiet-mui-ne',
                'description'   => 'Chi nhánh tại Mũi Né, khu nghỉ dưỡng nổi tiếng với bãi biển đẹp và đồi cát. Phục vụ khách du lịch và các resort cao cấp.',
                'address'       => '123 Nguyễn Đình Chiểu, Phường Hàm Tiến, Phan Thiết, Bình Thuận',
                'latitude'      => 10.9333,
                'longitude'     => 108.1000,
                'phone'         => '+842523456789',
                'email'         => 'muine@autorental.vn',
                'opening_time'  => '07:00:00',
                'closing_time'  => '21:00:00',
                'is_24_7'       => false,
                'is_airport'    => false,
                'is_popular'    => true,
                'is_active'     => true,
                'sort_order'    => 10,
            ],
        ];

        foreach ($locations as $locationData) {
            Location::create($locationData);
        }

        $this->command->info("✅ {$this->count()} locations created in Southern Vietnam");
        $this->command->newLine();

        $this->command->info('🎉 Location seeding completed!');
        $this->command->info("📊 Total locations: " . Location::count());
        $this->command->info("   - Airport locations: " . Location::where('is_airport', true)->count());
        $this->command->info("   - Popular locations: " . Location::where('is_popular', true)->count());
        $this->command->info("   - 24/7 locations: " . Location::where('is_24_7', true)->count());
        $this->command->info("   - Active locations: " . Location::where('is_active', true)->count());
    }

    /**
     * Count total locations.
     */
    private function count(): int
    {
        return 10;
    }
}
