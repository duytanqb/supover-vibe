# Factory Management Module

## Overview
Comprehensive factory network management với capacity monitoring, pricing optimization, và performance tracking.

## Key Features
- Factory onboarding và profiling
- Variant mapping và capability tracking
- Dynamic pricing management
- Capacity monitoring
- Quality control
- Performance analytics

## Factory Profile
```javascript
Factory Entity:
{
  name, contact_info, address
  service_regions: ["US", "EU", "APAC"]
  capabilities: {
    daily_capacity: 1000,
    specialties: ["apparel", "accessories"],
    quality_grade: "premium"
  }
  sla_commitments: {
    production_time: 72, // hours
    shipping_time: 48
  }
}
Variant Mapping
Internal Variant → Factory Variant
    ↓                    ↓
"T-Shirt-M-Black" → "TEE_M_BLK_001"
    ↓                    ↓  
Base Cost + Print Cost + Handling
Pricing Structure
javascriptPricing Tiers:
{
  base_cost: 8.50,
  print_cost: 2.00, 
  handling_fee: 1.50,
  quantity_breaks: [
    {min_qty: 1, discount: 0},
    {min_qty: 50, discount: 0.10},
    {min_qty: 100, discount: 0.15}
  ]
}
API Endpoints
# Factory Management
GET    /api/factories              # List factories
POST   /api/factories              # Add new factory
PUT    /api/factories/[id]         # Update factory profile
GET    /api/factories/[id]/capacity # Real-time capacity

# Variants & Pricing
GET    /api/factories/[id]/variants    # Factory variants
POST   /api/factories/[id]/pricing    # Update pricing
GET    /api/factories/[id]/performance # Performance metrics

# Fulfillment Interface
POST   /api/factories/[id]/orders     # Send order to factory
PUT    /api/fulfillments/[id]/status  # Status updates from factory
POST   /api/fulfillments/[id]/tracking # Tracking information
UI Components

FactoryDirectory: Searchable factory list
FactoryProfile: Detailed factory information
CapacityMonitor: Real-time capacity dashboard
PricingManager: Dynamic pricing interface
PerformanceMetrics: Quality và SLA tracking
OrderAssignment: Drag-drop order routing

Performance Metrics

Production time averages
Quality scores (defect rates)
SLA compliance percentage
Cost efficiency ratios
Capacity utilization

Integration Features

API templates for factory systems
Webhook endpoints for status updates
File upload for bulk pricing updates
Automated capacity polling
Quality score calculations

Database Tables

factories, factory_regions, factory_capabilities
factory_variants, factory_pricing
fulfillments, fulfillment_tracking
factory_performance_metrics