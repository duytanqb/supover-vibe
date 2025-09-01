# CLAUDE.md

## Fulfillment Hub - Project Context

### Project Overview
A comprehensive fulfillment hub management system for Print-on-Demand (POD) businesses with **multi-store**, **multi-channel** support, **factory integration**, **financial system**, and **advanced analytics**.

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript  
- **Backend**: Next.js API Routes, tRPC (future consideration)  
- **Database**: PostgreSQL with Prisma ORM  
- **Styling**: Tailwind CSS, shadcn/ui  
- **Authentication**: NextAuth.js  
- **State Management**: Zustand  
- **Forms**: React Hook Form + Zod validation  
- **Charts**: Recharts  
- **Icons**: Lucide React  

---

## Architecture Principles
- Monorepo structure with clear separation of concerns  
- Type-safe API and end-to-end TypeScript  
- Component-driven development  
- Database-first design with Prisma  
- Progressive enhancement using server components  
- Scalability, observability, and maintainability at core  

---

## Key Features Roadmap
1. **Phase 1**: User management, team management, permission management, basic store/product management  
2. **Phase 2**: Order processing, factory integration  
3. **Phase 3**: Financial system, real-time P&L  
4. **Phase 4**: Advanced analytics, reporting  
5. **Phase 5**: AI integration (forecasting, anomaly detection, optimization, auto-reporting)  

---

## Development Workflow

### Branching Strategy
- `main`: stable production  
- `develop`: staging branch  
- `feature/*`: per feature  
- `hotfix/*`: urgent bug fixes  

### CI/CD Pipeline
- Build → Lint → Test → Deploy (Staging → Production)  
- GitHub Actions / Vercel / Docker → AWS Lambda  

### Code Style
- ESLint + Prettier enforced  
- Type-safe with strict TypeScript mode  
- Error boundaries and loading states required for UI  

### Testing
- **Unit Tests**: Jest  
- **Integration/E2E**: Playwright  
- **Coverage Goal**: 80%+ for business logic  

---

## Database & Migration Strategy
Refer to `/docs/database-schema.md`

- Version-controlled migrations (Prisma migrate)  
- Rollback capabilities for production  
- Data seeding for development  
- Indexing and query optimization for performance  

---

## Deployment & Monitoring
Refer to `/docs/deployment.md`

- Environments: Dev → Staging → Production  
- Automated backups & recovery plan  
- Application & DB monitoring, error alerting  
- Business metrics tracking  

---

## Documentation Index
All modules are documented under `/docs`:

- [User Management](/docs/user-management.md)  
- [Store & Product Management](/docs/store-product.md)
- [Design Management](/docs/design-management.md)  
- [Order Processing](/docs/order-processing.md)  
- [Factory Management](/docs/factory-management.md)  
- [Financial System](/docs/financial-system.md)  
- [Reporting & Analytics](/docs/reporting-analytics.md)  
- [Deployment Guide](/docs/deployment.md)  
- [Database Schema](/docs/database-schema.md)  

---

## AI Integration (Phase 5 Scope)
- **Predictive Analytics**: demand forecasting, seller performance prediction  
- **Optimization**: smart routing, pricing optimization  
- **Financial AI**: anomaly detection in P&L  
- **Automation**: AI-generated reports & summaries  
- **NLP Interfaces**: natural language queries for analytics  

---

## Rules (Code & Commit)

### Coding Rules
- Always write **type-safe TypeScript**  
- Follow **Next.js 14 App Router conventions**  
- Use **Server Components by default**, Client Components only when needed  
- Apply **React Hook Form + Zod** for all form validations  
- Ensure **API endpoints documented** with input/output types  
- Include **loading states** and **error boundaries** for all async components  
- Optimize queries with Prisma (avoid N+1 queries)  

### Commit Rules (Conventional Commits)
- `feat:` → New feature  
- `fix:` → Bug fix  
- `docs:` → Documentation changes  
- `style:` → Code style/formatting (no logic changes)  
- `refactor:` → Code refactor without feature changes  
- `test:` → Adding or updating tests  
- `chore:` → Build process or tooling changes  

**Examples:**
- `feat(order): add smart routing algorithm`  
- `fix(user): resolve role assignment bug`  
- `docs(reporting): update analytics API references`  

---

## Project Structure
```
/src/app             → Next.js App Router (pages, layouts)
/src/components      → Reusable UI components
/src/lib             → Utilities, configs, business logic
/src/types           → TypeScript types
/prisma              → DB schema & migrations
/docs                → Module documentation
```
