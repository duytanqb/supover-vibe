# Seller Advance Module

## Overview
Module quản lý ứng tiền cho seller.  
Công ty ứng trước chi phí (fulfillment hoặc tài nguyên), cuối kỳ sẽ đối soát với revenue thực tế từ TikTok.  
Profit sau khi trừ toàn bộ advance sẽ được chia theo tỷ lệ 50/50 giữa seller và công ty.

---

## Advance Categories
- **Fulfillment Advance**: Chi phí sản xuất, in ấn, vận chuyển.
- **Resource Advance**: Chi phí tài khoản, proxy, tool, ads, vận hành.
- **Other**: Các loại chi phí khác (có thể mở rộng).

---

## Workflow
1. **Request**
   - Seller tạo yêu cầu ứng tiền, chọn category (fulfillment/resource).
   - Gửi lên hệ thống duyệt.

2. **Approval**
   - Finance/Admin xét duyệt, áp dụng hạn mức ứng theo hiệu suất seller.
   - Ghi nhận vào bảng `cash_advances`.

3. **Usage**
   - Fulfillment: công ty chi trực tiếp cho factory/shipper.
   - Resource: công ty thanh toán tài khoản, proxy, hoặc cấp tiền mặt.

4. **Reconciliation (End of Cycle)**
   - Revenue TikTok về ví hệ thống.
   - Hệ thống đối soát:
     ```
     Profit = Revenue - (Fulfillment Advances + Resource Advances)
     ```
   - Profit dương → chia 50/50 (credit vào seller wallet và company account).
   - Profit âm → advance outstanding, chuyển sang kỳ sau.

---

## Key Features
- Advance request & approval workflow
- Multi-category advance tracking
- Real-time seller wallet updates
- Automatic profit-sharing calculation
- Advance limit per seller (configurable)
- Carry-over outstanding advance

---

## API Endpoints
```http
# Advance Management
POST   /api/advances/request           # Seller request advance
GET    /api/advances                   # List advances
PUT    /api/advances/[id]/approve      # Approve/reject advance
GET    /api/advances/[id]/repayment    # Repayment schedule

# Wallet Integration
GET    /api/wallets/[sellerId]         # Wallet balance
GET    /api/wallets/[sellerId]/transactions # Wallet transactions
POST   /api/wallets/[sellerId]/credit  # Credit (profit share, bonus)
POST   /api/wallets/[sellerId]/debit   # Debit (advance repayment)
```

---

## UI Components
- **AdvanceRequestForm**: Form seller gửi yêu cầu ứng tiền.
- **AdvanceApprovalPanel**: Giao diện finance/admin duyệt ứng tiền.
- **AdvanceList**: Danh sách ứng tiền, filter theo category/status.
- **SellerWallet**: Hiển thị số dư, advance outstanding, lịch sử giao dịch.
- **ProfitSharingReport**: Báo cáo lợi nhuận và chia sẻ cuối kỳ.

---

## Database Tables
- **cash_advances**
  - id, seller_id, type (fulfillment | resource | other)
  - amount, status (pending, approved, repaid, outstanding)
  - created_at, approved_at
- **advance_repayments**
  - id, advance_id, seller_id
  - order_id (nullable)
  - amount, repayment_date
- **seller_wallets**
  - id, seller_id, balance, available_balance, hold
- **wallet_transactions**
  - id, wallet_id, type (credit | debit | hold | release)
  - amount, reference_id, created_at

---

## Business Rules
- **Advance Limit**: Mỗi seller có hạn mức ứng theo performance (doanh thu, tỷ lệ hoàn thành).
- **Margin Guardrails**: Từ chối advance nếu giá bán quá thấp dẫn tới rủi ro âm lợi nhuận.
- **Outstanding Advance**: Nếu kỳ hiện tại lỗ, advance chuyển sang kỳ sau.
- **Approval Workflow**: Yêu cầu advance phải được finance/admin duyệt trước khi cấp.
- **Audit Logging**: Tất cả giao dịch ứng tiền và repayment phải được log lại.

---
