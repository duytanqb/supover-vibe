# Database Migrations & Schema Documentation

This folder contains the database schema documentation for all tables in the system. Each table has its own file describing its structure, relationships, and purpose.

## Structure

```
migrations/
├── README.md           # This file
├── tables/            # Individual table schemas
│   ├── user.md
│   ├── team.md
│   ├── store.md
│   ├── product.md
│   ├── order.md
│   ├── factory.md
│   ├── cash-advance.md
│   └── ...
└── schema-history/    # Version history of schema changes
```

## How to Use

1. **View Table Structure**: Navigate to `tables/[table-name].md` to see the structure of any table
2. **Modify Schema**: Edit the relevant table file and update the Prisma schema accordingly
3. **Generate Migration**: Run `npx prisma migrate dev --name [description]` after updating schema
4. **Push Changes**: Run `npx prisma db push` for development updates

## Common Commands

```bash
# Generate a new migration
npx prisma migrate dev --name [migration-name]

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: destroys all data)
npx prisma migrate reset

# View current schema status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

## Table Categories

### Core System
- User Management (users, roles, permissions)
- Team Management (teams, team members)
- Authentication (sessions, tokens)

### Business Operations
- Stores & Products
- Orders & Fulfillment
- Factory Integration
- Design Management

### Financial System
- Cash Advances
- Seller Wallets
- Transactions
- Profit Sharing

### Analytics & Reporting
- Audit Logs
- Performance Metrics
- Financial Reports

## Contributing

When modifying database schema:
1. Update the relevant file in `tables/`
2. Update the Prisma schema file
3. Run migrations
4. Document the change in schema-history
5. Test thoroughly before committing