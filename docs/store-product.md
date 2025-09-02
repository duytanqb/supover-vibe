# Store & Product Management Module

## Overview
Seller-owned multi-store product catalog with design integration for auto-fulfillment. Each seller manages their stores within team context, with products linked to reusable designs for instant order processing.

## Key Features
- **Seller-owned stores** within team structure
- **Product-design coupling** for auto-fulfillment
- **Channel-agnostic product catalog** with variant management
- **Design asset integration** for instant reuse
- **Auto-listing generation** from product + design combinations
- **Seller-scoped pricing and margins**

## Seller-Store-Product Hierarchy
```
Seller (belongs to Team)
├── Store 1: "Dragon Merch TikTok"
│   ├── Product: "Basic T-Shirt" 
│   │   ├── Variant: S-Black-Cotton → Design: "Dragon Front"
│   │   ├── Variant: M-White-Cotton → Design: "Dragon Front"  
│   │   └── Variant: L-Red-Cotton → Design: "Dragon Back"
│   └── Product: "Hoodies"
└── Store 2: "Dragon Merch Amazon"
    └── Same products, different channel listings
```

## Auto-Fulfillment Integration
```
Order Received → Store Identified → Seller Context → Product Variant → Design Lookup
     ↓              ↓                ↓               ↓                ↓
Channel Data → Seller Mapping → Design Library → Variant Match → Auto-Fulfill
```

## Channel Integration
- API credential management
- Webhook endpoints for order sync
- Rate limiting and error handling
- Channel-specific product formatting

## API Endpoints
Stores
GET    /api/stores                    # List seller's stores
POST   /api/stores                    # Create new store
PUT    /api/stores/[id]              # Update store
GET    /api/stores/[id]/products     # Store products
Products
GET    /api/products                 # Product catalog
POST   /api/products                 # Create product
GET    /api/products/[id]/variants   # Product variants
POST   /api/products/[id]/designs    # Upload design
Listings
GET    /api/listings                 # Channel listings
POST   /api/listings/sync           # Sync to channel
PUT    /api/listings/[id]/price     # Update pricing

## UI Components
- StoreList: Multi-store dashboard
- ProductCatalog: Searchable product grid
- VariantManager: Variant creation/editing
- DesignUploader: Drag-drop design upload
- ListingSync: Channel synchronization status
- PriceManager: Bulk price updates

## Business Rules
- Floor price validation
- Margin guardrails
- Design ownership tracking
- Channel-specific requirements
- Inventory sync (future)

## Database Tables (Enhanced for Auto-Fulfillment)

**stores** (Seller-Owned)
- id, seller_id, team_id, name, platform
- api_credentials (encrypted), webhook_secret
- auto_fulfillment_enabled, reuse_team_designs
- status, settings (jsonb)

**products** (Seller Catalog)
- id, seller_id, store_id, title, description
- product_type, base_sku
- auto_listing_enabled, margin_floor
- created_by, status

**product_variants** (Physical Configurations)
- id, product_id, variant_sku
- size, color, material, weight
- base_price, cost_price, seller_margin
- print_methods_supported (jsonb)
- linked_design_id (for auto-fulfillment)

**product_design_mappings** (Auto-Fulfillment Links)
- id, product_variant_id, design_variant_id
- auto_created, reuse_count
- last_fulfilled_at, performance_score

**listings** (Channel-Specific)
- id, product_id, store_id, channel_listing_id
- channel_title, channel_description
- sync_status, last_synced_at
- channel_specific_data (jsonb)