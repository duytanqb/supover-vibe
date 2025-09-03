# Factory Table

## Table Name: `Factory`

## Purpose
Manages print-on-demand factories and suppliers for order fulfillment, including capabilities and pricing.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique factory identifier |
| code | String | UNIQUE, NOT NULL | Factory code (e.g., "FACT-VN-01") |
| name | String | NOT NULL | Factory name |
| type | FactoryType | NOT NULL | Factory type |
| country | String | NOT NULL | Country code (ISO) |
| city | String? | NULLABLE | City location |
| address | String? | NULLABLE | Full address |
| contactName | String? | NULLABLE | Primary contact name |
| contactEmail | String? | NULLABLE | Contact email |
| contactPhone | String? | NULLABLE | Contact phone |
| apiEndpoint | String? | NULLABLE | API endpoint URL |
| apiKey | String? | NULLABLE | API key (encrypted) |
| capabilities | String[] | @default([]) | Production capabilities |
| supportedProducts | String[] | @default([]) | Supported product types |
| productionTime | Int | @default(3) | Production time (days) |
| minOrderQuantity | Int | @default(1) | Minimum order quantity |
| maxDailyCapacity | Int? | NULLABLE | Maximum daily production |
| pricing | Json? | NULLABLE | Pricing structure |
| shippingZones | Json? | NULLABLE | Shipping zones and rates |
| qualityRating | Decimal(2,1)? | NULLABLE | Quality rating (0-5) |
| reliabilityScore | Decimal(3,2)? | NULLABLE | Reliability score (0-100) |
| isActive | Boolean | @default(true) | Active status |
| isPrimary | Boolean | @default(false) | Primary factory flag |
| teamId | String? | FK, NULLABLE | Assigned team |
| settings | Json? | NULLABLE | Factory settings |
| metadata | Json? | NULLABLE | Additional metadata |
| contractStartDate | DateTime? | NULLABLE | Contract start date |
| contractEndDate | DateTime? | NULLABLE | Contract end date |
| createdAt | DateTime | @default(now()) | Creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

## Enums

### FactoryType
```prisma
enum FactoryType {
  DTG         // Direct to Garment
  SCREEN_PRINT // Screen Printing
  SUBLIMATION  // Sublimation Printing
  EMBROIDERY   // Embroidery
  DTF         // Direct to Film
  HYBRID      // Multiple methods
}
```

## Relationships

- **team** → Team? (Many-to-One)
  - Assigned team (if exclusive)
- **factoryOrders** → FactoryOrder[] (One-to-Many)
  - Production orders
- **supplierVariants** → SupplierVariant[] (One-to-Many)
  - Factory-specific variants
- **priceRules** → FactoryPriceRule[] (One-to-Many)
  - Pricing rules

## Indexes

- Primary Key: `id`
- Unique: `code`
- Index: `country`
- Index: `isActive`
- Index: `teamId`
- Index: `type`

## Sample Data

```json
{
  "id": "clxfactory001",
  "code": "FACT-VN-01",
  "name": "Vietnam Premium Prints",
  "type": "DTG",
  "country": "VN",
  "city": "Ho Chi Minh City",
  "address": "123 Industrial Park, District 7",
  "contactName": "Nguyen Van A",
  "contactEmail": "contact@vnprints.com",
  "contactPhone": "+84901234567",
  "apiEndpoint": "https://api.vnprints.com/v1",
  "apiKey": "encrypted_api_key",
  "capabilities": ["DTG", "DTF", "EMBROIDERY"],
  "supportedProducts": ["T-SHIRT", "HOODIE", "TANK_TOP", "LONG_SLEEVE"],
  "productionTime": 2,
  "minOrderQuantity": 1,
  "maxDailyCapacity": 5000,
  "pricing": {
    "baseCost": {
      "T-SHIRT": 3.50,
      "HOODIE": 8.00
    },
    "printCost": {
      "DTG": 1.50,
      "DTF": 1.00
    },
    "rushFee": 2.00
  },
  "shippingZones": {
    "domestic": {
      "rate": 1.50,
      "days": 2
    },
    "international": {
      "rate": 5.00,
      "days": 7
    }
  },
  "qualityRating": 4.5,
  "reliabilityScore": 95.5,
  "isActive": true,
  "isPrimary": true,
  "settings": {
    "autoRouting": true,
    "qualityCheck": true,
    "expressProduction": true
  },
  "contractStartDate": "2024-01-01T00:00:00Z",
  "contractEndDate": "2024-12-31T23:59:59Z"
}
```

## Business Rules

1. Factory codes must be unique and follow naming convention
2. API credentials encrypted at rest
3. Primary factory used for auto-routing
4. Capacity limits enforced for order routing
5. Quality ratings updated based on order feedback
6. Contract dates determine active partnerships

## Factory Capabilities

### Production Methods
- **DTG**: Best for detailed, multi-color designs
- **Screen Print**: Cost-effective for bulk orders
- **Sublimation**: For polyester and light colors
- **Embroidery**: Premium, professional look
- **DTF**: Versatile, works on various materials

### Quality Metrics
- Quality Rating: Based on product quality scores
- Reliability Score: Based on on-time delivery
- Defect Rate: Percentage of defective products
- Response Time: API and communication responsiveness

## Migration Notes

- Consider adding factory certifications
- May need multi-location support per factory
- Could add seasonal capacity variations
- Future: Add factory performance analytics