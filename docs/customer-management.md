# Customer & Shipment Management Module

## Overview
This module provides comprehensive customer relationship management capabilities for the Supover Vibe fulfillment platform.

## 1. Customer Management

### Core Features

#### Customer Profiles
- Customer map with order
- Complete customer information management
- Multiple shipping addresses per customer
- Order history and analytics
- Communication preferences
- Customer segmentation and tagging

#### Customer Analytics
- Lifetime value (LTV) calculation
- Purchase frequency analysis
- Average order value tracking
- Churn prediction
- Customer cohort analysis

### Database Schema

```prisma
model Customer {
  id                String    @id @default(cuid())
  externalId        String?   // ID from source platform (TikTok, Shopify, etc.)
  email             String    @unique
  name              String
  phone             String?
  dateOfBirth       DateTime?
  gender            String?
  status            CustomerStatus @default(ACTIVE)
  source            String    // TIKTOK_SHOP, SHOPIFY, ETSY, etc.
  
  // Analytics fields
  totalSpent        Decimal   @default(0)
  orderCount        Int       @default(0)
  averageOrderValue Decimal   @default(0)
  lastOrderDate     DateTime?
  firstOrderDate    DateTime?
  
  // Metadata
  tags              String[]
  customFields      Json?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  addresses         Address[]
  orders            Order[]
  notes             CustomerNote[]
  communications    Communication[]
  supportTickets    SupportTicket[]
  reviews           Review[]
}

model Address {
  id           String   @id @default(cuid())
  customerId   String
  type         AddressType @default(SHIPPING)
  isDefault    Boolean  @default(false)
  
  // Address fields
  line1        String
  line2        String?
  city         String
  state        String
  postalCode   String
  country      String
  
  // Contact
  recipientName String
  phone        String?
  
  // Metadata
  validatedAt  DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  customer     Customer @relation(fields: [customerId], references: [id])
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  BLOCKED
  VIP
}

enum AddressType {
  SHIPPING
  BILLING
  BOTH
}
```

### API Endpoints

```typescript
// Customer CRUD
GET    /api/customers                 // List with pagination & filters
GET    /api/customers/:id            // Get customer details
POST   /api/customers                // Create customer
PUT    /api/customers/:id            // Update customer
DELETE /api/customers/:id            // Soft delete customer

// Customer Analytics
GET    /api/customers/:id/analytics  // Customer metrics
GET    /api/customers/:id/orders     // Order history
GET    /api/customers/:id/timeline   // Activity timeline

// Bulk Operations
POST   /api/customers/import         // Bulk import
POST   /api/customers/export         // Export to CSV
POST   /api/customers/merge          // Merge duplicate customers
```