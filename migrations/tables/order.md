# Order Table

## Table Name: `Order`

## Purpose
Manages customer orders from all connected stores, including fulfillment tracking and financial data.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique order identifier |
| orderNumber | String | UNIQUE, NOT NULL | Internal order number |
| orderCode | String | UNIQUE, NOT NULL | Short order code (e.g., "ORD-0001") |
| externalOrderId | String | NOT NULL | Platform order ID |
| externalOrderNumber | String? | NULLABLE | Platform order number |
| storeId | String | FK, NOT NULL | Source store |
| userId | String | FK, NOT NULL | Seller/owner |
| teamId | String? | FK, NULLABLE | Team association |
| customer | Json | NOT NULL | Customer details |
| shippingAddress | Json | NOT NULL | Shipping address |
| billingAddress | Json? | NULLABLE | Billing address |
| status | OrderStatus | @default(PENDING) | Order status |
| fulfillmentStatus | FulfillmentStatus | @default(UNFULFILLED) | Fulfillment status |
| paymentStatus | PaymentStatus | @default(PENDING) | Payment status |
| financialStatus | String? | NULLABLE | Platform financial status |
| subtotal | Decimal(10,2) | NOT NULL | Order subtotal |
| shipping | Decimal(10,2) | @default(0) | Shipping cost |
| tax | Decimal(10,2) | @default(0) | Tax amount |
| discount | Decimal(10,2) | @default(0) | Discount amount |
| total | Decimal(10,2) | NOT NULL | Order total |
| currency | String | @default("USD") | Order currency |
| exchangeRate | Decimal(10,4) | @default(1) | Currency exchange rate |
| notes | String? | NULLABLE | Order notes |
| tags | String[] | @default([]) | Order tags |
| metadata | Json? | NULLABLE | Platform metadata |
| placedAt | DateTime | NOT NULL | Order placement time |
| fulfilledAt | DateTime? | NULLABLE | Fulfillment completion |
| cancelledAt | DateTime? | NULLABLE | Cancellation time |
| syncedAt | DateTime? | NULLABLE | Last sync time |
| createdAt | DateTime | @default(now()) | Record creation |
| updatedAt | DateTime | @updatedAt | Last update |

## Enums

### OrderStatus
```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
  ON_HOLD
}
```

### FulfillmentStatus
```prisma
enum FulfillmentStatus {
  UNFULFILLED
  PARTIALLY_FULFILLED
  FULFILLED
  SHIPPED
  DELIVERED
}
```

### PaymentStatus
```prisma
enum PaymentStatus {
  PENDING
  PAID
  PARTIALLY_PAID
  REFUNDED
  FAILED
}
```

## Relationships

- **store** → Store (Many-to-One)
  - Source store
- **user** → User (Many-to-One)
  - Order owner
- **team** → Team? (Many-to-One)
  - Team association
- **items** → OrderItem[] (One-to-Many)
  - Order line items
- **fulfillments** → Fulfillment[] (One-to-Many)
  - Fulfillment records
- **factoryOrders** → FactoryOrder[] (One-to-Many)
  - Factory production orders
- **repayments** → AdvanceRepayment[] (One-to-Many)
  - Related advance repayments

## Indexes

- Primary Key: `id`
- Unique: `orderNumber`, `orderCode`
- Unique: `storeId, externalOrderId`
- Index: `userId, status`
- Index: `teamId, status`
- Index: `fulfillmentStatus`
- Index: `placedAt`
- Index: `createdAt`

## Sample Data

```json
{
  "id": "clxorder001",
  "orderNumber": "2024010001",
  "orderCode": "ORD-0001",
  "externalOrderId": "TT123456789",
  "externalOrderNumber": "#1001",
  "storeId": "clxstore001",
  "userId": "clx1234567890",
  "teamId": "clx9876543210",
  "customer": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "name": "Jane Smith",
    "line1": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90001",
    "country": "US"
  },
  "status": "PROCESSING",
  "fulfillmentStatus": "UNFULFILLED",
  "paymentStatus": "PAID",
  "subtotal": 49.99,
  "shipping": 5.99,
  "tax": 4.50,
  "discount": 5.00,
  "total": 55.48,
  "currency": "USD",
  "placedAt": "2024-01-20T15:30:00Z",
  "metadata": {
    "source": "tiktok_shop",
    "campaign": "winter_sale",
    "influencer": "@trendsetter"
  }
}
```

## Business Rules

1. Order numbers must be sequential and unique
2. Order codes are short, unique identifiers
3. Customer data stored as JSON for flexibility
4. Financial calculations: total = subtotal + shipping + tax - discount
5. Status transitions logged in audit trail
6. Cancelled orders cannot be fulfilled

## Financial Tracking

- Track actual costs vs revenue
- Calculate profit margins
- Support for advance repayments
- Multi-currency with exchange rates

## Migration Notes

- Consider adding order source tracking
- May need split payment support
- Could add order risk assessment
- Future: Add subscription order support