# Phân tích và đề xuất cải tiến architecture
claude-code analyze "Review current codebase and suggest architecture improvements"

# Generate migration scripts
claude-code migrate "Create database migration from current schema to new requirements"

# Security audit
claude-code security "Perform security audit and fix vulnerabilities"

# API documentation tự động
claude-code docs "Generate comprehensive API documentation with examples"

# Containerization
claude-code containerize "Create Docker configurations for all services"

# Kubernetes deployment
claude-code k8s "Generate Kubernetes manifests for production deployment"

# Monitoring setup
claude-code monitor "Setup comprehensive monitoring with Prometheus and Grafana"

# 1. Tạo project structure
mkdir fulfillment-hub
cd fulfillment-hub

# 2. Tạo các thư mục cần thiết
mkdir -p .claude docs src/{app,components,lib,types} prisma

# 3. Copy nội dung từ artifact vào các file tương ứng
# Bắt đầu với .claude/claude.md và docs/

# 4. Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# 5. Install additional dependencies
npm install @prisma/client prisma next-auth @next-auth/prisma-adapter zustand react-hook-form @hookform/resolvers zod recharts lucide-react

# Step 1: Database setup
claude-code generate "Create Prisma schema for user management module based on the documentation in docs/user-management.md"

# Step 2: Authentication system  
claude-code generate "Implement NextAuth.js authentication with RBAC based on the user roles defined in claude.md"

# Step 3: Basic UI components
claude-code generate "Create shadcn/ui components for user management interface following the components listed in docs/user-management.md"

# Step 4: API routes
claude-code generate "Implement Next.js API routes for user management endpoints as documented in docs/user-management.md"