# Module Quản Lý Người Dùng

## Tổng Quan
Quản lý người dùng toàn diện với kiểm soát truy cập dựa trên vai trò, tổ chức theo nhóm, và hỗ trợ đa thuê bao.

## Tính Năng
- Hệ thống người dùng đa vai trò
- Tổ chức theo nhóm
- Quyền chi tiết
- Ghi nhật ký kiểm toán
- Quản lý phiên làm việc

## Vai Trò Người Dùng
- **Admin**: Toàn quyền truy cập hệ thống
- **Seller (Người bán)**: Quản lý cửa hàng và đơn hàng
- **Designer (Nhà thiết kế)**: Quản lý tài nguyên thiết kế
- **Fulfiller (Nhà thực hiện)**: Vận hành nhà máy
- **Finance (Tài chính)**: Hoạt động tài chính
- **Support (Hỗ trợ)**: Hỗ trợ khách hàng
- **Leader (Trưởng nhóm)**: Quản lý nhóm

## Hệ Thống Phân Quyền
Các quyền:

users.read (đọc người dùng), users.write (ghi người dùng), users.delete (xóa người dùng)
stores.read (đọc cửa hàng), stores.write (ghi cửa hàng), stores.delete (xóa cửa hàng)
orders.read (đọc đơn hàng), orders.write (ghi đơn hàng), orders.delete (xóa đơn hàng)
finance.read (đọc tài chính), finance.write (ghi tài chính)
reports.read (đọc báo cáo)

## Cấu Trúc Nhóm
- Nhóm có thể chứa nhiều người bán
- Trưởng nhóm có quyền truy cập toàn bộ dữ liệu nhóm
- Quyền dựa trên phạm vi (nhóm, khu vực, cửa hàng)

## API Endpoints
GET    /api/users              # Danh sách người dùng phân trang
POST   /api/users              # Tạo người dùng mới
GET    /api/users/[id]         # Chi tiết người dùng
PUT    /api/users/[id]         # Cập nhật người dùng
DELETE /api/users/[id]         # Xóa người dùng
POST   /api/users/[id]/roles   # Phân quyền
GET    /api/teams              # Danh sách nhóm
POST   /api/teams              # Tạo nhóm

## UI Components
- UserList: Bảng người dùng phân trang
- UserForm: Form tạo/sửa người dùng
- RoleSelector: Chọn nhiều vai trò
- TeamManagement: Tạo nhóm và quản lý thành viên
- PermissionMatrix: Phân quyền trực quan

## Bảng Database
- users, roles, permissions, user_roles
- teams, team_members (người dùng chỉ tham gia một nhóm)
- audit_logs

## Ưu Tiên Triển Khai
1. Hoạt động CRUD người dùng cơ bản
2. Chức năng phân vai trò
3. Quản lý nhóm
4. Middleware kiểm tra quyền
5. Hệ thống ghi nhật ký kiểm toán