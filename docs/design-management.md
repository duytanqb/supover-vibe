# Design Management Module

## Overview
Seller-owned Design Management for POD auto-fulfillment using **standardized canvas (4500×5400 px @ 300 DPI)**. Designs belong to sellers within teams. When orders arrive with complete data, the system automatically detects reusable designs or creates new ones, enabling instant fulfillment without manual intervention.

## Key Features
- **Seller-owned design libraries** within team context
- **Auto-fulfillment** when orders have complete product and design data
- **Intelligent reuse detection** across seller's design history
- **Automated design-to-order linking** for instant production
- **Team-level design sharing** (optional, with seller permission)
- **Zero-touch fulfillment** for orders with existing designs
- **Designer assignment** only when new artwork is required
- **Print-ready file generation** with automatic factory routing

## Auto-Fulfillment Workflow

### **When Order Arrives:**
1. **Complete Order Data**: Order contains product SKU, artwork file, placement specs
2. **Seller Context**: Lookup seller's existing design library
3. **Fingerprint Check**: Calculate design fingerprint for reuse detection
4. **Auto-Decision**:
   - **REUSE** → Instant fulfillment (0-touch)
   - **CREATE** → Auto-assign designer or request seller approval

### **Lifecycle States**
- **Auto**: System auto-created from complete order data → instant production
- **Draft**: Incomplete data, needs seller input
- **Design**: Assigned to designer for artwork creation
- **Review**: Awaiting seller/team approval
- **Archived**: Approved, print-ready, available for reuse

### **Seller Ownership Model**
```
Seller "dragon_merch" (Team: NA_TEAM)
├── Design Library (private to seller)
│   ├── "Dragon Logo V1" → 15 variants → 234 orders fulfilled
│   ├── "Summer Collection" → 8 variants → 89 orders fulfilled
│   └── "Holiday 2024" → 12 variants → 156 orders fulfilled
└── Shared Access (team-level, with permission)
    ├── Can view team designs for inspiration
    └── Can request permission to clone/modify
```

## Reuse & Fingerprint System

### **Seller-Scoped Fingerprint**
```javascript
fingerprint = SHA256(
  seller_id +              // "seller_dragon_merch"
  product_sku +            // "TSHIRT-M-WHT-COT"
  print_method +           // "DTG"
  artwork_hash +           // SHA256 of source artwork file
  placement_config +       // "front_chest_4x4_center"
  print_options           // {"underbase": true, "bleed": 3mm}
)
```

### **Auto-Fulfillment Logic**
```typescript
async function processIncomingOrder(orderData) {
  const fingerprint = generateFingerprint(orderData)
  
  // 1. Check seller's design library first
  const existingDesign = await findSellerDesign(orderData.seller_id, fingerprint)
  
  if (existingDesign && existingDesign.status === 'ARCHIVED') {
    // INSTANT FULFILLMENT - 0 human touch
    return linkOrderToDesign(orderData.order_item_id, existingDesign.id)
  }
  
  // 2. Check team library (if seller allows team access)
  const teamDesign = await findTeamDesign(orderData.team_id, fingerprint)
  
  if (teamDesign && sellerAllowsTeamReuse(orderData.seller_id)) {
    // Clone to seller's library + instant fulfillment
    return cloneAndLinkDesign(teamDesign.id, orderData.seller_id, orderData.order_item_id)
  }
  
  // 3. Create new design variant
  return createNewDesignVariant(orderData)
}
```

## Data Model (Tables)

**designs** (Seller-Owned)
- id, seller_id, team_id, title, slug
- product_sku, print_method, placement
- canvas_w_px (4500), canvas_h_px (5400), dpi (300)
- fingerprint, status (auto|draft|design|review|archived)
- reuse_count, total_orders_fulfilled
- auto_fulfillment_enabled (boolean)
- team_sharing_enabled (boolean)
- created_by, updated_by, created_at, updated_at, archived_at

**design_versions**
- id, design_id, version, changelog, created_by, created_at

**design_assets**
- id, design_id, version
- role (source|proof|preview|print_ready|mockup)
- filename, storage_path, filesize, file_hash, mime
- width_px, height_px, dpi
- metadata jsonb

**design_variants** (Product-Specific Configurations)
- id, design_id, version
- product_variant_id, print_method
- placement_x, placement_y, width_inches, height_inches
- rotation, scale_factor
- print_options (jsonb: underbase, bleed_mm, mirror, etc.)
- layout_signature, sku_signature
- status, print_ready_file_id
- fulfillment_count, last_used_at

**design_order_links** (Auto-Fulfillment Tracking)  
- id, design_id, variant_id
- order_item_id, seller_id
- link_type (reuse|clone|new)
- auto_fulfilled (boolean)
- created_at, fulfilled_at

**design_approvals**
- id, design_id, variant_id
- approver_id, role
- status (approved|rejected|needs_changes)
- comment, created_at

**design_assignments**
- id, design_id, assignee_id, role
- due_at, priority, created_at, completed_at

**design_rights**
- id, design_id, license_type
- license_url, attribution, expires_at, notes

**design_audit_logs**
- id, design_id, actor_id, action, payload, created_at

## API Endpoints

**Auto-Fulfillment Core**
```
POST   /api/orders/process           # Auto-fulfill or create design
POST   /api/designs/fingerprint      # Check reuse potential
POST   /api/designs/auto-create      # Create from complete order data
```

**Seller Design Management**
```
GET    /api/sellers/:id/designs?status=&q=     # Seller's design library
POST   /api/sellers/:id/designs                # Create new design
GET    /api/designs/:id                        # Design details
PATCH  /api/designs/:id                        # Update design
POST   /api/designs/:id/variants               # Add variant configuration
```

**Team Collaboration** 
```
GET    /api/teams/:id/designs/shared           # Team shared designs
POST   /api/designs/:id/share                  # Share with team
POST   /api/designs/:id/clone                  # Clone to seller library
```

**Production Pipeline**
```
POST   /api/designs/:id/auto-approve           # Auto-approve for fulfillment
GET    /api/designs/:id/print-ready           # Get print files for factory
POST   /api/designs/:id/mark-fulfilled        # Track fulfillment
```

## Events
- design.created, design.assigned, design.submitted, design.approved, design.archived
- design.linked_to_order_item, design.variant.print_ready
- design.qc_failed, design.version_created

## Permissions
- **Seller**: request designs, view/approve proofs
- **Designer**: work on assigned designs, upload artwork
- **Leader**: approve/reject, manage team designs
- **Fulfiller**: assign designs, consume Archived designs
- **Admin**: full access

## UI Components
- DesignBoard (Kanban: Draft → Design → Review → Archived)
- DesignLibrary (search/filter)
- DesignDetail (tabs: Overview, Assets, Versions, Approvals, History)
- VariantEditor (offset/scale/rotation + DPI warning)
- ProofApproval (approve/reject)
- AssignmentPanel (task queue)

## Business Rules
- Only Archived designs or print-ready variants are valid for factory printing
- Any edit to Archived creates a new version
- Proof/preview watermarked, source restricted by role
- Reuse is team-scoped

## Reporting
- SLA (Draft→Archived)
- First-pass approval rate
- Reuse rate (%)
- Designer workload and throughput

## Migration Plan
1. Extract historical orders/artwork → normalize to 4500×5400
2. Compute fingerprint/layout_signature → group
3. Create one design per group; attach first artwork as source
4. Link order items via design_links
5. Mark as Archived if shipped without issue; else Review

## Done Criteria
- Designers assigned and submit work
- Approvals captured and print-ready generated
- Orders auto-link to Archived designs
- Factories see exactly one print-ready file per order item
- SLA and reuse metrics visible