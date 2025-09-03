# Team Table

## Table Name: `Team`

## Purpose
Manages seller teams/organizations that group users together for collaborative selling and shared resources.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique team identifier |
| name | String | NOT NULL | Team display name |
| code | String | UNIQUE, NOT NULL | Short team code (e.g., "TEAM01") |
| description | String? | NULLABLE | Team description |
| logo | String? | NULLABLE | Team logo URL |
| isActive | Boolean | @default(true) | Team active status |
| settings | Json? | NULLABLE | Team-specific settings |
| metadata | Json? | NULLABLE | Additional metadata |
| createdAt | DateTime | @default(now()) | Team creation time |
| updatedAt | DateTime | @updatedAt | Last update time |

## Relationships

- **members** → TeamMember[] (One-to-Many)
  - Team members and their roles
- **stores** → Store[] (One-to-Many)
  - Stores associated with the team
- **cashAdvances** → CashAdvance[] (One-to-Many)
  - Cash advances for team members
- **sellerWallets** → SellerWallet[] (One-to-Many)
  - Team member wallets
- **factories** → Factory[] (One-to-Many)
  - Factories assigned to team

## Indexes

- Primary Key: `id`
- Unique: `code`
- Index: `isActive`
- Index: `createdAt`

## Sample Data

```json
{
  "id": "clx9876543210",
  "name": "Alpha Sellers Group",
  "code": "ALPHA01",
  "description": "Premium POD sellers specializing in trending designs",
  "logo": "https://example.com/team-logo.png",
  "isActive": true,
  "settings": {
    "autoFulfillment": true,
    "profitShareRatio": 0.5,
    "advanceLimit": 5000
  },
  "metadata": {
    "region": "US-West",
    "tier": "premium"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## Business Rules

1. Team code must be unique and uppercase
2. At least one admin member required per team
3. Teams can have custom advance limits
4. Profit sharing ratios configurable per team
5. Inactive teams cannot create new orders

## Migration Notes

- Added support for team-level financial settings
- Consider adding team hierarchy for larger organizations
- May need team categories/types in future