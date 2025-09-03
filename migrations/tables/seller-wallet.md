# SellerWallet Table

## Table Name: `SellerWallet`

## Purpose
Manages financial wallets for sellers, tracking balances, credit limits, and transaction history.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique wallet identifier |
| userId | String | FK, UNIQUE, NOT NULL | User who owns the wallet |
| teamId | String | FK, NOT NULL | Team association |
| balance | Decimal(10,2) | @default(0) | Current wallet balance |
| availableBalance | Decimal(10,2) | @default(0) | Available balance (excluding holds) |
| holdAmount | Decimal(10,2) | @default(0) | Amount on hold |
| advanceLimit | Decimal(10,2) | @default(1000) | Maximum advance limit |
| totalAdvances | Decimal(10,2) | @default(0) | Total advances received |
| totalRepayments | Decimal(10,2) | @default(0) | Total repayments made |
| totalProfitShare | Decimal(10,2) | @default(0) | Total profit share earned |
| currency | String | @default("USD") | Wallet currency |
| isActive | Boolean | @default(true) | Wallet active status |
| metadata | Json? | NULLABLE | Additional metadata |
| lastActivityAt | DateTime? | NULLABLE | Last transaction timestamp |
| createdAt | DateTime | @default(now()) | Wallet creation time |
| updatedAt | DateTime | @updatedAt | Last update time |

## Relationships

- **user** → User (One-to-One)
  - Wallet owner
- **team** → Team (Many-to-One)
  - Team association
- **transactions** → WalletTransaction[] (One-to-Many)
  - Transaction history

## Indexes

- Primary Key: `id`
- Unique: `userId` (one wallet per user)
- Index: `teamId`
- Index: `isActive`
- Index: `lastActivityAt`

## Sample Data

```json
{
  "id": "clxwallet001",
  "userId": "clx1234567890",
  "teamId": "clx9876543210",
  "balance": 2500.00,
  "availableBalance": 2000.00,
  "holdAmount": 500.00,
  "advanceLimit": 5000.00,
  "totalAdvances": 10000.00,
  "totalRepayments": 8500.00,
  "totalProfitShare": 1000.00,
  "currency": "USD",
  "isActive": true,
  "metadata": {
    "creditScore": 750,
    "riskLevel": "low",
    "lastReview": "2024-01-01"
  },
  "lastActivityAt": "2024-01-20T15:30:00Z",
  "createdAt": "2023-06-01T00:00:00Z",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

## Business Rules

1. One wallet per user
2. Available balance = balance - holdAmount
3. Cannot request advance exceeding (advanceLimit - outstanding advances)
4. Negative balance allowed for automatic deductions
5. Hold amounts released after order completion
6. All transactions must update lastActivityAt

## Wallet Operations

### Credit Operations
- Profit share distributions
- Manual credits by admin
- Refunds

### Debit Operations
- Advance repayments
- Fee deductions
- Manual debits by admin

### Hold Operations
- Place hold for pending operations
- Release hold after completion

## Migration Notes

- Consider adding multi-currency support
- May need wallet limits based on user tier
- Could add automatic sweep to bank accounts