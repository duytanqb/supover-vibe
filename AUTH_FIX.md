# Authentication Fix Instructions

## Issue
The Users and Teams pages are not fetching data because of authentication/permission issues. The API endpoints require ADMIN or SUPER_ADMIN roles.

## Solution

### Option 1: Use the Admin Token (Quick Fix)

1. Open your browser and navigate to the application (http://localhost:3001)
2. Open the browser console (F12 or Cmd+Option+I on Mac)
3. Copy and paste this command:

```javascript
localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWYxd2Z1M3owMDBvamtuMmVwZXh3NnZ3IiwiZW1haWwiOiJzdXBlcmFkbWluQGRyYWdvbm1lZGlhLmNvbSIsImlhdCI6MTc1NjgxMzc2MiwiZXhwIjoxNzU3NDE4NTYyfQ.Q2vbqCuhdr2-Kz5rftF-E9OCZMM-A1teJl5CKJIksBA'); window.location.reload();
```

This will log you in as the Super Admin user (superadmin@dragonmedia.com).

### Option 2: Login Through the UI

1. Go to http://localhost:3001/login
2. Use these credentials:
   - Email: `superadmin@dragonmedia.com`
   - Password: `password123` (or whatever password was set in the seed data)

### Option 3: Generate a New Token

If the token above has expired, run this command to generate a new one:

```bash
npx tsx scripts/generate-admin-token.ts
```

Then follow the instructions printed in the console.

## Available Test Users

Based on the database seed data, these users should be available:

1. **Super Admin**
   - Email: superadmin@dragonmedia.com
   - Roles: SUPER_ADMIN
   - Has full access to all features

2. **Admin**
   - Email: admin@dragonmedia.com  
   - Roles: ADMIN
   - Has access to user and team management

3. **Seller**
   - Email: sarah@dragonmedia.com
   - Roles: SELLER
   - Limited access (cannot view users/teams)

## Troubleshooting

If you're still having issues:

1. Check that the database is running:
   ```bash
   npx prisma studio
   ```

2. Verify database has data:
   ```bash
   npx tsx scripts/test-db.ts
   ```

3. Test API endpoints directly:
   ```bash
   npx tsx scripts/test-api.ts
   ```

## API Permission Requirements

- `/api/users` - Requires: ADMIN or SUPER_ADMIN
- `/api/teams` - Requires: ADMIN, SUPER_ADMIN, or LEADER
- `/api/roles` - Requires: ADMIN or SUPER_ADMIN
- `/api/permissions` - Requires: SUPER_ADMIN

## Notes

- The JWT secret is stored in `.env` as `JWT_SECRET`
- Tokens expire after 7 days
- All API endpoints check for valid authentication and appropriate permissions