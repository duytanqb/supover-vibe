# CLAUDE.md (Tiếng Việt)

## Trung Tâm Fulfillment - Bối Cảnh Dự Án

### Tổng Quan Dự Án
Hệ thống quản lý trung tâm fulfillment toàn diện cho doanh nghiệp Print-on-Demand (POD) với hỗ trợ **đa cửa hàng**, **đa kênh**, **tích hợp nhà máy**, **hệ thống tài chính**, và **phân tích nâng cao**.

### Tech Stack (Công Nghệ Sử Dụng)
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript  
- **Backend**: Next.js API Routes, tRPC (đang xem xét)  
- **Cơ sở dữ liệu**: PostgreSQL với Prisma ORM  
- **Styling**: Tailwind CSS, shadcn/ui  
- **Xác thực**: NextAuth.js  
- **Quản lý State**: Zustand  
- **Forms**: React Hook Form + Zod validation  
- **Biểu đồ**: Recharts  
- **Icons**: Lucide React  

---

## Nguyên Tắc Kiến Trúc
- Cấu trúc monorepo với phân tách rõ ràng các mối quan tâm  
- API type-safe và TypeScript end-to-end  
- Phát triển theo hướng component  
- Thiết kế ưu tiên database với Prisma  
- Nâng cao tiến bộ sử dụng server components  
- Khả năng mở rộng, quan sát và bảo trì là cốt lõi  

---

## Lộ Trình Tính Năng Chính
1. **Giai đoạn 1**: Quản lý người dùng, quản lý nhóm, quản lý quyền, quản lý cơ bản cửa hàng/sản phẩm  
2. **Giai đoạn 2**: Xử lý đơn hàng, tích hợp nhà máy  
3. **Giai đoạn 3**: Hệ thống tài chính, P&L thời gian thực  
4. **Giai đoạn 4**: Phân tích nâng cao, báo cáo  
5. **Giai đoạn 5**: Tích hợp AI (dự báo, phát hiện bất thường, tối ưu hóa, tự động báo cáo)  

---

## Quy Trình Phát Triển

### Chiến Lược Nhánh
- `main`: production ổn định  
- `develop`: nhánh staging  
- `feature/*`: theo tính năng  
- `hotfix/*`: sửa lỗi khẩn cấp  

### CI/CD Pipeline
- Build → Lint → Test → Deploy (Staging → Production)  
- GitHub Actions / Vercel / Docker → AWS Lambda  

### Code Style
- ESLint + Prettier được thực thi  
- Type-safe với chế độ TypeScript nghiêm ngặt  
- Error boundaries và loading states bắt buộc cho UI  

### Testing
- **Unit Tests**: Jest  
- **Integration/E2E**: Playwright  
- **Mục tiêu Coverage**: 80%+ cho business logic  

---

## Chiến Lược Database & Migration
Tham khảo `/docs/database-schema.md`

- Migrations được kiểm soát phiên bản (Prisma migrate)  
- Khả năng rollback cho production  
- Data seeding cho development  
- Indexing và tối ưu query cho hiệu suất  

---

## Deployment & Monitoring
Tham khảo `/docs/deployment.md`

- Môi trường: Dev → Staging → Production  
- Tự động backup & kế hoạch khôi phục  
- Giám sát ứng dụng & DB, cảnh báo lỗi  
- Theo dõi metrics kinh doanh  

---

## Mục Lục Tài Liệu
Tất cả modules được ghi chép tại `/docs`:

- [Quản Lý Người Dùng](/docs/user-management.md)  
- [Quản Lý Cửa Hàng & Sản Phẩm](/docs/store-product.md)
- [Quản Lý Thiết Kế](/docs/design-management.md)  
- [Xử Lý Đơn Hàng](/docs/order-processing.md)  
- [Quản Lý Nhà Máy](/docs/factory-management.md)  
- [Hệ Thống Tài Chính](/docs/financial-system.md)  
- [Báo Cáo & Phân Tích](/docs/reporting-analytics.md)  
- [Hướng Dẫn Deployment](/docs/deployment.md)  
- [Schema Database](/docs/database-schema.md)  

---

## Tích Hợp AI (Phạm Vi Giai Đoạn 5)
- **Phân Tích Dự Đoán**: dự báo nhu cầu, dự đoán hiệu suất người bán  
- **Tối Ưu Hóa**: định tuyến thông minh, tối ưu giá  
- **AI Tài Chính**: phát hiện bất thường trong P&L  
- **Tự Động Hóa**: báo cáo & tóm tắt tự động bằng AI  
- **Giao Diện NLP**: truy vấn phân tích bằng ngôn ngữ tự nhiên  

---

## Quy Tắc (Code & Commit)

### Quy Tắc Coding
- Luôn viết **TypeScript type-safe**  
- Tuân theo **quy ước Next.js 14 App Router**  
- Sử dụng **Server Components mặc định**, Client Components chỉ khi cần  
- Áp dụng **React Hook Form + Zod** cho mọi form validation  
- Đảm bảo **API endpoints được ghi chép** với input/output types  
- Bao gồm **loading states** và **error boundaries** cho mọi async components  
- Tối ưu queries với Prisma (tránh N+1 queries)  

### Quy Tắc Commit (Conventional Commits)
- `feat:` → Tính năng mới  
- `fix:` → Sửa lỗi  
- `docs:` → Thay đổi tài liệu  
- `style:` → Code style/formatting (không thay đổi logic)  
- `refactor:` → Tái cấu trúc code không thay đổi tính năng  
- `test:` → Thêm hoặc cập nhật tests  
- `chore:` → Thay đổi build process hoặc công cụ  

**Ví dụ:**
- `feat(order): thêm thuật toán định tuyến thông minh`  
- `fix(user): sửa lỗi phân quyền`  
- `docs(reporting): cập nhật tham chiếu API phân tích`  

---

## Cấu Trúc Dự Án
```
/src/app             → Next.js App Router (pages, layouts)
/src/components      → UI components có thể tái sử dụng
/src/lib             → Utilities, configs, business logic
/src/types           → TypeScript types
/prisma              → DB schema & migrations
/docs                → Tài liệu modules
```

# Lưu Ý Quan Trọng
Làm những gì được yêu cầu; không hơn, không kém.
KHÔNG BAO GIỜ tạo files trừ khi chúng thực sự cần thiết để đạt mục tiêu.
LUÔN ưu tiên chỉnh sửa file hiện có hơn là tạo file mới.
KHÔNG BAO GIỜ chủ động tạo file tài liệu (*.md) hoặc README. Chỉ tạo file tài liệu khi người dùng yêu cầu rõ ràng.