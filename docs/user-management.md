# User Management Module

## Overview
Comprehensive user management and role-based access control, team organization, and multi-tenancy support.

## Features
- Multi-role user system
- Team-based organization
- Granular permissions
- Audit logging
- Session management

## User Roles
- **Admin**: Full system access
- **Seller**: Store and order management
- **Designer**: Design asset management
- **Fulfiller**: Factory operations
- **Finance**: Financial operations
- **Support**: Customer support
- **Leader**: Team management

## Permission System
Permissions:

users.read, users.write, users.delete
stores.read, stores.write, stores.delete
orders.read, orders.write, orders.delete
finance.read, finance.write
reports.read

## Team Structure
- Teams can contain multiple sellers
- Leaders can access to all team data
- Scope-based permissions (team, region, store)

## API Endpoints
GET    /api/users              # List users pagination
POST   /api/users              # Create new user
GET    /api/users/[id]         # Get user details
PUT    /api/users/[id]         # Update user
DELETE /api/users/[id]         # Delete user
POST   /api/users/[id]/roles   # Assign roles
GET    /api/teams              # List teams
POST   /api/teams              # Create team

## UI Components
- UserList: Paginated user table
- UserForm: Create/edit user form
- RoleSelector: Multi-select role assignment
- TeamManagement: Team creation and member management
- PermissionMatrix: Visual permission assignment

## Database Tables
- users, roles, permissions, user_roles
- teams, team_members (user can join one team)
- audit_logs

## Implementation Priority
1. Basic user CRUD operations
2. Role assignment functionality  
3. Team management
4. Permission checking middleware
5. Audit logging system

