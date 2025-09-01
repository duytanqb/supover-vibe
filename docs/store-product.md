# Store & Product Management Module

## Overview
Multi-store, multi-channel product management với design asset integration và listing synchronization.

## Key Features
- Multi-store per seller support
- Channel integration (TikTok, Amazon, Etsy)
- Internal product catalog
- Design asset management
- Automated listing sync
- Price management với margin protection

## Store Management
Store Entity:

name, description, settings
channel_type (tiktok_shop, amazon, etsy)
api_credentials (encrypted)
region, currency, timezone
status (active, suspended, archived)


## Product Catalog
Product Hierarchy:
Product → ProductVariants → SKU Mappings
↓
Designs → Assets (images, mockups)
↓
Listings → Channel-specific data

## Channel Integration
- API credential management
- Webhook endpoints for order sync
- Rate limiting và error handling
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

## Database Tables
- stores, store_settings, store_channels
- products, product_variants, product_designs
- listings, listing_variants
- designs, design_assets