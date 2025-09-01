# System Architecture

## Overview
Fulfillment Hub follows a modular monolith architecture built on Next.js with PostgreSQL, designed for scalability và maintainability.

## Core Architecture Patterns
- **Server-First**: Leverage Next.js server components
- **Database-First**: Prisma schema drives TypeScript types
- **Component-Driven**: Reusable UI components với props interface
- **API-First**: Well-defined API contracts

## Application Layers
┌─────────────────┐
│   Presentation  │  Next.js App Router, React Components
├─────────────────┤
│   Business      │  Custom hooks, utilities, validation
├─────────────────┤
│   Data Access   │  Prisma ORM, database queries
├─────────────────┤
│   Database      │  PostgreSQL
└─────────────────┘

## Module Dependencies
User Management ← Store Management ← Order Processing
↓                   ↓
Factory Management ← Financial System
↓
Analytics & Reporting

## Security Architecture
- Role-based access control (RBAC)
- JWT-based authentication via NextAuth.js
- Input validation với Zod schemas
- SQL injection protection via Prisma
- CSRF protection built-in Next.js

## Performance Considerations
- Server-side rendering với caching
- Database query optimization
- Image optimization với Next.js
- Code splitting by route
- Progressive loading strategies

