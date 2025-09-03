# CashAdvance Table

## Table Name: `CashAdvance`

## Purpose
Manages cash advance requests from sellers for fulfillment costs, resources, and other business needs.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique advance identifier |
| advanceNumber | String | UNIQUE, NOT NULL | Human-readable advance number (e.g., "ADV-2024-0001") |
| userId | String | FK, NOT NULL | User requesting the advance |
| teamId | String | FK, NOT NULL | Team associated with advance |
| type | AdvanceType | NOT NULL | Type of advance (FULFILLMENT, RESOURCE, OTHER) |
| amount | Decimal(10,2) | NOT NULL | Requested advance amount |
| currency | String | @default("USD") | Currency code |
| status | AdvanceStatus | @default(PENDING) | Current advance status |
| reason | String | NOT NULL | Reason for advance request |
| notes | String? | NULLABLE | Additional notes |
| rejectionNote | String? | NULLABLE | Reason for rejection |
| dueDate | DateTime? | NULLABLE | Expected repayment date |
| requestedAt | DateTime | @default(now()) | Request timestamp |
| approvedAt | DateTime? | NULLABLE | Approval timestamp |
| approvedBy | String? | FK, NULLABLE | Admin who approved |
| rejectedAt | DateTime? | NULLABLE | Rejection timestamp |
| rejectedBy | String? | FK, NULLABLE | Admin who rejected |
| disbursedAt | DateTime? | NULLABLE | Disbursement timestamp |
| disbursedBy | String? | FK, NULLABLE | Admin who disbursed |
| repaidAmount | Decimal(10,2) | @default(0) | Amount already repaid |
| outstandingAmount | Decimal(10,2) | @default(0) | Remaining balance |
| metadata | Json? | NULLABLE | Additional metadata |
| createdAt | DateTime | @default(now()) | Creation timestamp |
| updatedAt | DateTime | @updatedAt | Last update timestamp |

## Enums

### AdvanceType
```prisma
enum AdvanceType {
  FULFILLMENT  // For order fulfillment costs
  RESOURCE     // For tools, materials, resources
  OTHER        // Other business needs
}
```

### AdvanceStatus
```prisma
enum AdvanceStatus {
  PENDING         // Awaiting approval
  APPROVED        // Approved, awaiting disbursement
  REJECTED        // Rejected by admin
  DISBURSED       // Funds disbursed
  PARTIALLY_REPAID // Partial repayment made
  REPAID          // Fully repaid
  OUTSTANDING     // Overdue
  CANCELLED       // Cancelled by user
}
```

## Relationships

- **user** → User (Many-to-One)
  - User requesting the advance
- **team** → Team (Many-to-One)
  - Team association
- **approver** → User? (Many-to-One)
  - Admin who approved
- **rejector** → User? (Many-to-One)
  - Admin who rejected
- **disburser** → User? (Many-to-One)
  - Admin who disbursed
- **repayments** → AdvanceRepayment[] (One-to-Many)
  - Repayment history
- **auditLogs** → AuditLog[] (One-to-Many)
  - Audit trail

## Indexes

- Primary Key: `id`
- Unique: `advanceNumber`
- Index: `userId, status` (for user queries)
- Index: `teamId, status` (for team queries)
- Index: `status, requestedAt` (for admin dashboard)
- Index: `dueDate` (for overdue tracking)

## Sample Data

```json
{
  "id": "clx5555555555",
  "advanceNumber": "ADV-2024-0042",
  "userId": "clx1234567890",
  "teamId": "clx9876543210",
  "type": "FULFILLMENT",
  "amount": 1500.00,
  "currency": "USD",
  "status": "DISBURSED",
  "reason": "Q1 2024 inventory purchase for trending products",
  "notes": "Expected high demand for Valentine's Day designs",
  "dueDate": "2024-03-31T00:00:00Z",
  "requestedAt": "2024-01-15T10:30:00Z",
  "approvedAt": "2024-01-15T14:00:00Z",
  "approvedBy": "clxadmin123",
  "disbursedAt": "2024-01-16T09:00:00Z",
  "disbursedBy": "clxfinance456",
  "repaidAmount": 750.00,
  "outstandingAmount": 750.00,
  "metadata": {
    "orderIds": ["ORD-001", "ORD-002"],
    "expectedROI": 2.5
  }
}
```

## Business Rules

1. Advance amount cannot exceed user's credit limit
2. Only PENDING advances can be approved/rejected
3. Only APPROVED advances can be disbursed
4. Repayments automatically update outstanding amount
5. Status changes trigger wallet transactions
6. All status changes must be logged in audit trail

## Migration Notes

- Consider adding interest/fee fields for future
- May need approval workflow with multiple approvers
- Could add automatic repayment from order profits