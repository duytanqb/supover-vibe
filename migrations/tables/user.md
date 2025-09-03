# User Table

## Table Name: `User`

## Purpose
Stores user account information for all system users including admins, sellers, and team members.

## Schema Structure

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| id | String | PK, @default(cuid()) | Unique user identifier |
| email | String | UNIQUE, NOT NULL | User email address |
| password | String | NOT NULL | Hashed password |
| name | String | NOT NULL | User display name |
| avatar | String? | NULLABLE | Avatar URL |
| isActive | Boolean | @default(true) | Account active status |
| emailVerified | DateTime? | NULLABLE | Email verification timestamp |
| createdAt | DateTime | @default(now()) | Account creation time |
| updatedAt | DateTime | @updatedAt | Last update time |
| lastLogin | DateTime? | NULLABLE | Last login timestamp |
| role | String? | NULLABLE | Legacy role field |

## Relationships

- **userRoles** → UserRole[] (One-to-Many)
  - User can have multiple roles
- **teamMember** → TeamMember? (One-to-One)
  - User's team membership
- **stores** → Store[] (One-to-Many)
  - Stores owned by user
- **orders** → Order[] (One-to-Many)
  - Orders created by user
- **cashAdvances** → CashAdvance[] (One-to-Many)
  - User's cash advance requests
- **sellerWallet** → SellerWallet? (One-to-One)
  - User's wallet for financial transactions
- **auditLogs** → AuditLog[] (One-to-Many)
  - Actions performed by user

## Indexes

- Primary Key: `id`
- Unique: `email`
- Index: `isActive` (for filtering active users)
- Index: `createdAt` (for sorting)

## Sample Data

```json
{
  "id": "clx1234567890",
  "email": "john@example.com",
  "password": "$2b$10$...", // bcrypt hash
  "name": "John Doe",
  "avatar": "https://example.com/avatar.jpg",
  "isActive": true,
  "emailVerified": "2024-01-15T10:00:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z",
  "lastLogin": "2024-01-20T08:30:00Z"
}
```

## Business Rules

1. Email must be unique across the system
2. Password must be hashed using bcrypt
3. New users start with isActive = true
4. Email verification is required for certain operations
5. Soft delete is implemented via isActive flag

## Migration Notes

- Added `sellerWallet` relationship for cash advance feature
- Added `lastLogin` field for tracking user activity
- Consider adding two-factor authentication fields in future