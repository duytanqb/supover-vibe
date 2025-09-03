# Store Table

## Table Name: `Store`

## Purpose
Manages e-commerce stores connected to the platform (TikTok Shop, Shopify, etc.) for multi-channel selling.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique store identifier |
| name | String | NOT NULL | Store display name |
| platform | Platform | NOT NULL | E-commerce platform |
| storeId | String | NOT NULL | External platform store ID |
| storeName | String? | NULLABLE | Platform store name |
| accessToken | String? | NULLABLE | OAuth access token (encrypted) |
| refreshToken | String? | NULLABLE | OAuth refresh token (encrypted) |
| apiKey | String? | NULLABLE | API key (encrypted) |
| apiSecret | String? | NULLABLE | API secret (encrypted) |
| webhookSecret | String? | NULLABLE | Webhook verification secret |
| domain | String? | NULLABLE | Store domain/URL |
| currency | String | @default("USD") | Store currency |
| timezone | String | @default("UTC") | Store timezone |
| isActive | Boolean | @default(true) | Store active status |
| isPrimary | Boolean | @default(false) | Primary store flag |
| lastSyncAt | DateTime? | NULLABLE | Last sync timestamp |
| settings | Json? | NULLABLE | Store-specific settings |
| metadata | Json? | NULLABLE | Additional metadata |
| userId | String | FK, NOT NULL | Store owner |
| teamId | String? | FK, NULLABLE | Team association |
| createdAt | DateTime | @default(now()) | Store creation time |
| updatedAt | DateTime | @updatedAt | Last update time |

## Enums

### Platform
```prisma
enum Platform {
  TIKTOK_SHOP
  SHOPIFY
  WOO_COMMERCE
  ETSY
  AMAZON
  EBAY
  CUSTOM
}
```

## Relationships

- **user** → User (Many-to-One)
  - Store owner
- **team** → Team? (Many-to-One)
  - Optional team association
- **products** → Product[] (One-to-Many)
  - Products in this store
- **orders** → Order[] (One-to-Many)
  - Orders from this store
- **designs** → Design[] (Many-to-Many via StoreDesign)
  - Designs available in store

## Indexes

- Primary Key: `id`
- Unique: `platform, storeId` (one connection per platform store)
- Index: `userId`
- Index: `teamId`
- Index: `isActive`
- Index: `platform`
- Index: `lastSyncAt`

## Sample Data

```json
{
  "id": "clxstore001",
  "name": "My TikTok Shop",
  "platform": "TIKTOK_SHOP",
  "storeId": "7123456789",
  "storeName": "Trendy Tees Official",
  "accessToken": "encrypted_token_here",
  "refreshToken": "encrypted_refresh_token",
  "domain": "https://www.tiktok.com/@trendytees",
  "currency": "USD",
  "timezone": "America/Los_Angeles",
  "isActive": true,
  "isPrimary": true,
  "lastSyncAt": "2024-01-20T10:00:00Z",
  "settings": {
    "autoFulfillment": true,
    "syncInterval": 300,
    "webhooksEnabled": true,
    "priceMarkup": 1.5
  },
  "metadata": {
    "monthlyOrders": 500,
    "rating": 4.8,
    "followers": 25000
  },
  "userId": "clx1234567890",
  "teamId": "clx9876543210",
  "createdAt": "2023-12-01T00:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

## Business Rules

1. Access tokens must be encrypted at rest
2. One primary store per user/team
3. Store credentials validated on creation
4. Automatic token refresh for OAuth platforms
5. Webhook secrets used for request validation
6. Regular sync intervals configurable per store

## API Integration

### TikTok Shop
- OAuth 2.0 authentication
- Webhook support for real-time updates
- Product and order sync

### Shopify
- OAuth 2.0 authentication
- GraphQL API integration
- Webhook notifications

### WooCommerce
- REST API with key/secret
- Webhook support

## Migration Notes

- Consider adding store categories
- May need multi-region support
- Could add store performance metrics
- Future: Add marketplace fee tracking