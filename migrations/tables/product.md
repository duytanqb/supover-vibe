# Product Table

## Table Name: `Product`

## Purpose
Manages products across different stores, including variants, pricing, and inventory tracking.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique product identifier |
| storeId | String | FK, NOT NULL | Store containing this product |
| externalId | String | NOT NULL | External platform product ID |
| title | String | NOT NULL | Product title |
| description | String? | NULLABLE | Product description |
| handle | String? | NULLABLE | URL handle/slug |
| productType | String? | NULLABLE | Product category/type |
| vendor | String? | NULLABLE | Product vendor/brand |
| tags | String[] | @default([]) | Product tags |
| images | Json[] | @default([]) | Product images |
| status | ProductStatus | @default(DRAFT) | Product status |
| publishedAt | DateTime? | NULLABLE | Publication timestamp |
| isActive | Boolean | @default(true) | Active status |
| metadata | Json? | NULLABLE | Platform-specific metadata |
| syncedAt | DateTime? | NULLABLE | Last sync timestamp |
| createdAt | DateTime | @default(now()) | Creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

## Enums

### ProductStatus
```prisma
enum ProductStatus {
  DRAFT       // Not published
  ACTIVE      // Published and available
  ARCHIVED    // Archived/hidden
  OUT_OF_STOCK // No inventory
}
```

## Relationships

- **store** → Store (Many-to-One)
  - Store containing product
- **variants** → ProductVariant[] (One-to-Many)
  - Product variants (size, color, etc.)
- **orderItems** → OrderItem[] (One-to-Many)
  - Order line items
- **designs** → ProductDesign[] (One-to-Many)
  - Design assignments

## Indexes

- Primary Key: `id`
- Unique: `storeId, externalId` (one product per store)
- Index: `storeId, status`
- Index: `productType`
- Index: `isActive`
- Index: `syncedAt`

## Sample Data

```json
{
  "id": "clxprod001",
  "storeId": "clxstore001",
  "externalId": "7891234567",
  "title": "Vintage Sunset T-Shirt",
  "description": "Premium cotton t-shirt with vintage sunset design",
  "handle": "vintage-sunset-tshirt",
  "productType": "T-Shirts",
  "vendor": "Premium Prints Co",
  "tags": ["vintage", "sunset", "cotton", "unisex"],
  "images": [
    {
      "id": "img001",
      "url": "https://cdn.example.com/product1.jpg",
      "alt": "Front view",
      "position": 1
    }
  ],
  "status": "ACTIVE",
  "publishedAt": "2024-01-01T00:00:00Z",
  "isActive": true,
  "metadata": {
    "platformRating": 4.5,
    "reviewCount": 125,
    "bestSeller": true
  },
  "syncedAt": "2024-01-20T12:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-20T12:00:00Z"
}
```

## Business Rules

1. Products must have at least one variant
2. External ID must be unique per store
3. Price and inventory managed at variant level
4. Images stored as JSON array with position
5. Status changes trigger store sync
6. Archived products remain in database

## Migration Notes

- Consider adding SEO fields (meta title, description)
- May need product collections/categories
- Could add product reviews integration
- Future: Add product recommendations