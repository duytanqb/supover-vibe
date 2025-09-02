Overview

Centralized design management module for handling artwork assets, order integration.
Designs are linked to product items in orders and can be reused for future orders with the same product configuration.

Key Features

Centralized design library per team

Mapping designs to order items

Reuse of designs across multiple orders

Versioning and approvals workflow

Print-ready file generation

Asset storage (source files, previews, mockups)

Rights and license tracking

Role-based access (Seller, Designer, Fulfiller)

Design Lifecycle

Draft → Design → Review → Archived

Draft: Initial upload or creation

Design: Design assigned to designer and being designing

Review: Approved for production use after designer upload and finish artwork

Archived: Print-ready files generated and approved manual or AI

Reuse Logic
When a new order item is created:

If a matching fingerprint exists and status is Approved→ reuse existing design

If partial match → suggest clone/variant

If no match → create new design in Draft

API Endpoints
Designs
GET    /api/designs                     # List designs with filters
POST   /api/designs                     # Create new design
GET    /api/designs/[id]                # Get design details
PUT    /api/designs/[id]                # Update design metadata
DELETE /api/designs/[id]                # Archive design
POST   /api/designs/[id]/lock           # Lock design version

Variants & Files
POST   /api/designs/[id]/variants       # Create design variant
GET    /api/designs/[id]/variants       # List design variants
POST   /api/designs/[id]/files          # Upload design file (source/proof/print-ready)

Linking & Approvals
POST   /api/designs/[id]/link-order     # Link design to order item
POST   /api/designs/[id]/approve        # Approve design/variant
POST   /api/designs/[id]/reject         # Reject with feedback

Reuse & Fingerprint
POST   /api/designs/fingerprint/lookup  # Check for reusable design

UI Components

DesignLibrary: Search and filter designs

DesignDetail: Metadata, versions, assets

VariantEditor: Placement and sizing controls

ProofApproval: Preview and approve/reject flow

AssignmentBoard: Task management for designers

Database Tables

designs: Main design entity

design_versions: Version history

design_assets: Files (source, preview, print-ready)

design_variants: Product/print variations

design_links: Mapping to order items

design_approvals: Approval records

design_rights: License and ownership details

Permissions

Seller: Request designs, approve/reject proofs

Designer: Create and edit designs for assigned team

Leader: Manage team designs, finalize approvals

Fulfiller: View print-ready locked designs only

Admin: Full access

Business Rules

Only Locked designs are sent to factories

Any modification to Locked designs creates a new version

Reuse is scoped to team; cross-team reuse not allowed

Proofs must be watermarked for Seller review

Rights/license must be tracked for compliance

Integration with Other Modules

User Management: Roles and team scoping

Store & Product Management: Products and variants reference designs

Order Processing: Order items link to designs

Factory Management: Factories consume print-ready locked designs

Reporting & Analytics: Design SLA, reuse rate, approval metrics