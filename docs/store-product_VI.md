# Module Quản Lý Cửa Hàng & Sản Phẩm

## Tổng Quan
Danh mục sản phẩm đa cửa hàng thuộc sở hữu người bán với tích hợp thiết kế để tự động thực hiện. Mỗi người bán quản lý cửa hàng trong bối cảnh nhóm, với sản phẩm liên kết với thiết kế tái sử dụng để xử lý đơn hàng tức thì.

## Tính Năng Chính
- **Cửa hàng thuộc người bán** trong cấu trúc nhóm
- **Ghép nối sản phẩm-thiết kế** để tự động thực hiện
- **Danh mục sản phẩm đa kênh** với quản lý biến thể
- **Tích hợp tài sản thiết kế** để tái sử dụng tức thì
- **Tự động tạo danh sách** từ kết hợp sản phẩm + thiết kế
- **Giá và lợi nhuận theo phạm vi người bán**

## Phân Cấp Người Bán-Cửa Hàng-Sản Phẩm
```
Người Bán (thuộc Nhóm)
├── Cửa hàng 1: "Dragon Merch TikTok"
│   ├── Sản phẩm: "Áo Thun Cơ Bản" 
│   │   ├── Biến thể: S-Đen-Cotton → Thiết kế: "Rồng Mặt Trước"
│   │   ├── Biến thể: M-Trắng-Cotton → Thiết kế: "Rồng Mặt Trước"  
│   │   └── Biến thể: L-Đỏ-Cotton → Thiết kế: "Rồng Mặt Sau"
│   └── Sản phẩm: "Áo Hoodie"
└── Cửa hàng 2: "Dragon Merch Amazon"
    └── Cùng sản phẩm, danh sách kênh khác nhau
```

## Tích Hợp Tự Động Thực Hiện
```
Nhận Đơn → Xác Định Cửa Hàng → Bối Cảnh Người Bán → Biến Thể Sản Phẩm → Tra Cứu Thiết Kế
     ↓              ↓                ↓                   ↓                ↓
Dữ Liệu Kênh → Ánh Xạ Người Bán → Thư Viện Thiết Kế → Khớp Biến Thể → Tự Động Thực Hiện
```

## Tích Hợp Kênh
- Quản lý thông tin API
- Webhook endpoints để đồng bộ đơn hàng
- Giới hạn tốc độ và xử lý lỗi
- Định dạng sản phẩm theo kênh

## API Endpoints
Cửa Hàng
GET    /api/stores                    # Danh sách cửa hàng người bán
POST   /api/stores                    # Tạo cửa hàng mới
PUT    /api/stores/[id]              # Cập nhật cửa hàng
GET    /api/stores/[id]/products     # Sản phẩm cửa hàng
Sản Phẩm
GET    /api/products                 # Danh mục sản phẩm
POST   /api/products                 # Tạo sản phẩm
GET    /api/products/[id]/variants   # Biến thể sản phẩm
POST   /api/products/[id]/designs    # Tải thiết kế
Danh Sách
GET    /api/listings                 # Danh sách kênh
POST   /api/listings/sync           # Đồng bộ lên kênh
PUT    /api/listings/[id]/price     # Cập nhật giá

## UI Components
- StoreList: Dashboard đa cửa hàng
- ProductCatalog: Lưới sản phẩm có thể tìm kiếm
- VariantManager: Tạo/sửa biến thể
- DesignUploader: Kéo thả tải thiết kế
- ListingSync: Trạng thái đồng bộ kênh
- PriceManager: Cập nhật giá hàng loạt

## Quy Tắc Kinh Doanh
- Xác thực giá sàn
- Biên lợi nhuận an toàn
- Theo dõi quyền sở hữu thiết kế
- Yêu cầu theo kênh cụ thể
- Đồng bộ tồn kho (tương lai)

## Bảng Database (Nâng Cao cho Tự Động Thực Hiện)

**stores** (Thuộc Người Bán)
- id, seller_id, team_id, name, platform
- api_credentials (mã hóa), webhook_secret
- auto_fulfillment_enabled, reuse_team_designs
- status, settings (jsonb)

**products** (Danh Mục Người Bán)
- id, seller_id, store_id, title, description
- product_type, base_sku
- auto_listing_enabled, margin_floor
- created_by, status

**product_variants** (Cấu Hình Vật Lý)
- id, product_id, variant_sku
- type, color, size
- base_price, cost_price, seller_margin
- print_methods_supported (jsonb)
- linked_design_id (cho tự động thực hiện)

**product_design_mappings** (Liên Kết Tự Động Thực Hiện)
- id, product_variant_id, design_variant_id
- auto_created, reuse_count
- last_fulfilled_at, performance_score

**listings** (Theo Kênh Cụ Thể)
- id, product_id, store_id, channel_listing_id
- channel_title, channel_description
- sync_status, last_synced_at
- channel_specific_data (jsonb)