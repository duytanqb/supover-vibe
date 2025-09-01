# Order Processing Module

## Overview  
Intelligent order processing với multi-channel ingestion, smart routing, và real-time tracking.

## Order Lifecycle
New → Validated → Routed → Producing → Shipped → Completed
↓            ↓         ↓         ↓
Cancelled    Failed    Delayed   Delivered

## Key Features
- Multi-channel order ingestion
- Order validation và standardization  
- Smart routing to factories
- Real-time status tracking
- Exception handling
- Order bundling/batching

## Order Ingestion
```javascript
// Webhook handlers for each channel
POST /api/webhooks/tiktok
POST /api/webhooks/amazon  
POST /api/webhooks/etsy

// Manual order import
POST /api/orders/import
Routing Engine
Routing Factors:
- Product compatibility
- Factory capacity
- Geographic proximity  
- Cost optimization
- Quality scores
- SLA requirements
API Endpoints
GET    /api/orders                 # List orders với filters
GET    /api/orders/[id]           # Order details
PUT    /api/orders/[id]/route     # Manual routing
POST   /api/orders/batch          # Batch operations
GET    /api/orders/stats          # Order statistics

# Order Items
GET    /api/orders/[id]/items     # Order line items
PUT    /api/orders/[id]/items/[itemId]/status  # Update item status

# Fulfillment  
POST   /api/fulfillments          # Create fulfillment
PUT    /api/fulfillments/[id]     # Update fulfillment status
GET    /api/fulfillments/tracking # Tracking updates
UI Components

OrderList: Advanced filtering và sorting
OrderDetails: Comprehensive order view
RoutingInterface: Drag-drop factory assignment
StatusTimeline: Visual order progression
BatchProcessor: Bulk order operations
TrackingUpdates: Real-time status feed

Business Logic

Order validation rules
Routing optimization algorithms
Status transition rules
Exception escalation
SLA monitoring
Cost calculation

Database Tables

orders, order_items, order_status_history
fulfillments, fulfillment_tracking
routing_rules, routing_history