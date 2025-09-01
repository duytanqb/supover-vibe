# Database Schema Design

## Core Entities Overview

Users (RBAC) → Teams → Sellers → Stores → Products
↓
Orders → OrderItems → Fulfillments → Factories
↓
Financial Transactions → Payouts

## Key Tables Structure

### User Management
- **users**: User accounts and authentication
- **roles**: System roles (Admin, Seller, etc.)
- **permissions**: Granular permissions
- **user_roles**: User-role assignments
- **teams**: Team organization
- **team_members**: Team membership

### Store & Product Management  
- **stores**: Multi-store per seller
- **store_channels**: Channel integrations (TikTok, Amazon)
- **products**: Internal product catalog
- **product_variants**: Size, color variations
- **designs**: Design assets and ownership
- **listings**: Channel-specific product listings

### Order Processing
- **orders**: Main order entity
- **order_items**: Individual items trong order
- **order_status_history**: Status tracking
- **fulfillments**: Factory fulfillment records

### Factory Management
- **factories**: Factory profiles
- **factory_variants**: Factory-specific variants
- **factory_pricing**: Dynamic pricing tiers
- **factory_capabilities**: Service regions, capacity

### Financial System
- **transactions**: All financial transactions
- **seller_wallets**: Seller balance tracking  
- **payouts**: Payout history
- **cash_advances**: Advance program
- **reconciliations**: Settlement matching

## Relationships & Constraints
- Foreign key constraints for referential integrity
- Unique constraints for business rules
- Check constraints for data validation
- Indexes for query performance

## Migration Strategy
- Version-controlled migrations
- Rollback capabilities
- Data seeding for development
- Production migration procedures