# Database Schema

## Overview
The Supover Fulfillment Hub uses PostgreSQL with Prisma ORM, implementing a comprehensive schema with 38+ models and 23 enums for complete fulfillment operations.

## Core Models

### User & Permission System
```prisma
User
├── id, email, username, password
├── roles (many-to-many via UserRoles)
├── sessions (active sessions)
└── impersonationSessions (admin features)

Role (SUPER_ADMIN, ADMIN, SELLER, DESIGNER, FULFILLER, FINANCE, SUPPORT, LEADER)
├── permissions (many-to-many via RolePermissions)
└── users (many-to-many via UserRoles)

Permission
├── resource (USER, STORE, PRODUCT, ORDER, etc.)
├── action (CREATE, READ, UPDATE, DELETE, EXECUTE)
└── roles (many-to-many)
```

### Team & Organization
```prisma
Team
├── name, description
├── leader (User)
├── members (TeamMember[])
├── stores (owned stores)
└── designs (team designs)

TeamMember
├── user
├── team
├── isLeader
└── joinedAt
```

### Store
```prisma
Store
├── platform (TIKTOK_SHOP, SHOPIFY, ETSY, AMAZON, WOOCOMMERCE)
├── team (owner)
├── products
├── orders
└── apiCredentials

Product
├── store
├── sku, name, description
├── basePrice, costPrice
├── systemVariants (5-character codes)
├── designs
├── product_id
└── status (DRAFT, ACTIVE, DISCONTINUED)

SystemVariant (Master Variants)
├── code (5-char unique)
├── product
├── attributes (size, color, material, style)
├── pricing (price, costPrice)
├── stock
└── supplierVariants (factory mappings)

SupplierVariant (Factory-Specific)
├── factory
├── systemVariantCode (links to SystemVariant)
├── supplierProductCode, supplierVariantCode, supplierSku
├── supplierPrice, minimumQuantity, leadTime
└── availability status
```

### Design & Creative Assets
```prisma
Design
├── seller_id (owner)
├── fingerprint (unique identifier)
├── status (DRAFT, REVIEW, APPROVED, ARCHIVED)
├── isAutoFulfillmentReady
├── products (linked products)
└── metadata (tags, designer, version)

ProductDesign
├── product
├── design
├── placementSettings
└── isDefault
```

### Order Management
```prisma
Order
├── orderCode (9-character unique)
├── store
├── customer (link to customer table)
├── status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
├── items (OrderItem[])
├── fulfillments
├── statusHistory
└── financials (subtotal, shipping, tax, total)

OrderItem
├── order
├── product, systemVariant
├── design (if applicable)
├── quantity, price
└── fulfillmentStatus

Fulfillment
├── order
├── factory
├── status
├── trackingNumber
└── items
```

### Factory & Supplier System
```prisma
Factory
├── name, code
├── supplierType (MANUFACTURER, PRINTER, DISTRIBUTOR, FULFILLMENT_CENTER)
├── capabilities[], printMethods[]
├── capacity, qualityRating
├── locations (FactoryLocation[])
├── supplierVariants
├── certifications[]
└── isPrimary

FactoryLocation
├── factory
├── locationType (PRODUCTION, WAREHOUSE, OFFICE)
├── address details
├── capabilities[]
├── capacity
└── shippingZones[]

SupplierOrder
├── factory
├── orderNumber
├── status
├── items
└── timeline (orderedAt, expectedAt, receivedAt)

Production
├── factory
├── batchNumber
├── status
├── items
└── qualityChecks


Review
├── product
├── customer
├── rating (1-5)
├── verified
├── photos[]
└── response (from seller)
```

### Logistics & Shipping
```prisma
Shipment
├── order
├── carrier, trackingNumber
├── status
└── timeline

EnhancedShipment (Advanced Tracking)
├── shipment
├── multiCarrierTracking
├── trackingEvents (TrackingEvent[])
├── exceptions (ShipmentException[])
└── proofOfDelivery

Return
├── order
├── rmaNumber
├── reason, status
├── items
├── refundAmount
└── statusHistory
```

### Financial & Analytics
```prisma
Transaction
├── type (PAYMENT, REFUND, ADJUSTMENT)
├── amount, currency
├── status
├── reference
└── metadata

AnalyticsCache
├── metricType (REVENUE, ORDERS, CONVERSION, etc.)
├── dimensions (period, store, product, etc.)
├── value
├── calculatedAt
└── ttl

AnalyticsEvent
├── eventType
├── entityType, entityId
├── metadata
└── timestamp

ReportDefinition
├── name, type
├── schedule (cron expression)
├── configuration
├── recipients
└── executions (ReportExecution[])
```

### System Management
```prisma
SystemSettings
├── key, value
├── category
├── isPublic
└── updatedBy

AuditLog
├── userId
├── action, resource
├── entityId
├── changes (before/after)
├── ipAddress, userAgent
└── timestamp
```

## Enums

### User & Permissions
- **UserRole**: SUPER_ADMIN, ADMIN, LEADER, SELLER, DESIGNER, FULFILLER, FINANCE, SUPPORT
- **PermissionResource**: USER, ROLE, PERMISSION, STORE, PRODUCT, ORDER, DESIGN, FACTORY, ANALYTICS, SETTINGS, TEAM
- **PermissionAction**: CREATE, READ, UPDATE, DELETE

### Store & Commerce
- **Platform**: TIKTOK_SHOP, SHOPIFY, ETSY, AMAZON, WOOCOMMERCE
- **ProductStatus**: DRAFT, ACTIVE, DISCONTINUED, OUT_OF_STOCK

### Orders & Fulfillment
- **OrderStatus**: PENDING, PROCESSING, SHIPPED, COMPLETED, CANCELLED, REFUNDED
- **FulfillmentStatus**: PENDING, IN_PRODUCTION, SHIPPED, DELIVERED, FAILED
- **PaymentStatus**: PENDING, PROCESSING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED

### Design & Quality
- **DesignStatus**: DRAFT, REVIEW, APPROVED, ARCHIVED
- **QualityCheckStage**: PRE_PRODUCTION, IN_PRODUCTION, POST_PRODUCTION, PRE_SHIPPING
- **QualityCheckResult**: PASS, FAIL, CONDITIONAL

### Logistics
- **ShipmentStatus**: CREATED, DISPATCHED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED, LOST
- **ReturnStatus**: REQUESTED, APPROVED, SHIPPED, RECEIVED, PROCESSING, COMPLETED, REJECTED
- **ReturnReason**: DEFECTIVE, WRONG_ITEM, NOT_AS_DESCRIBED, DAMAGED, NO_LONGER_NEEDED, OTHER

### Customer & Support
- **CustomerStatus**: ACTIVE, INACTIVE, BLOCKED, VIP
- **TicketStatus**: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **TicketPriority**: LOW, MEDIUM, HIGH, CRITICAL

### Analytics & Reports
- **MetricType**: TOTAL_REVENUE, TOTAL_ORDERS, AVERAGE_ORDER_VALUE, CONVERSION_RATE, RETURN_RATE, CUSTOMER_LIFETIME_VALUE, TOP_PRODUCTS, TOP_CUSTOMERS
- **ReportType**: SALES, INVENTORY, FULFILLMENT, CUSTOMER, FINANCIAL, CUSTOM
- **ReportFormat**: PDF, EXCEL, CSV, JSON

### System
- **InventoryType**: ON_HAND, RESERVED, IN_TRANSIT, DAMAGED
- **MovementType**: RECEIPT, SHIPMENT, ADJUSTMENT, TRANSFER, RETURN, DAMAGE
- **TransactionType**: PAYMENT, REFUND, ADJUSTMENT, FEE, COMMISSION
- **TransactionStatus**: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED

## Key Relationships

### Core Business Flow
1. **User** → **Team** → **Store** → **Product** → **Order**
2. **Design** → **Product** → **Auto-Fulfillment**
3. **Order** → **Fulfillment** → **Factory** → **Production**
4. **SystemVariant** ↔ **SupplierVariant** (variant mapping)
5. **Customer** → **Order** → **Return**/**Review**

### Permission Hierarchy
1. **User** ↔ **Role** ↔ **Permission**
2. **Role-based access control** for all resources
3. **Team-based ownership** for stores and designs

### Financial Flow
1. **Order** → **Transaction** (payment)
2. **Return** → **Transaction** (refund)
3. **Analytics** aggregation for reporting

## Database Indexes

### Performance Optimizations
- Unique indexes on: email, username, orderCode, rmaNumber, sku, design fingerprint
- Composite indexes on: (teamId, name), (factoryId, isDefault), (productId, designId)
- Search indexes on: product name, customer email, order code
- Foreign key indexes on all relationships

## Migration Strategy

### Schema Evolution
1. **Version controlled** migrations using Prisma
2. **Rollback capabilities** for all changes
3. **Data seeding** for development and testing
4. **Zero-downtime** migration support

### Backup & Recovery
1. **Point-in-time recovery** capability
2. **Daily automated backups**
3. **Transaction log archival**
4. **Disaster recovery** procedures

## Performance Considerations

### Query Optimization
- Indexed searches on frequently queried fields
- Pagination support on all list endpoints
- Eager loading for related data when needed
- Query result caching for analytics

### Data Archival
- Historical data moved to archive tables
- Soft deletes for audit trail maintenance
- Periodic cleanup of expired sessions
- Analytics data aggregation for performance