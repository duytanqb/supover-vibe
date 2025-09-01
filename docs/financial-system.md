# Financial System Module

## Overview
Comprehensive financial management với real-time P&L tracking, multi-currency support, và automated reconciliation.

## Key Features
- Real-time profit/loss calculation
- Multi-currency support với FX handling
- Seller wallet system
- Cash advance program  
- Automated reconciliation
- Financial reporting

## P&L Calculation
```javascript
Order P&L Structure:
{
  revenue: channel_payout,
  costs: {
    product_cost: factory_base_cost,
    print_cost: factory_print_cost,
    shipping_cost: fulfillment_shipping,
    channel_fees: platform_fees,
    payment_processing: gateway_fees
  },
  profit: revenue - total_costs,
  margin: profit / revenue
}
Multi-Currency Handling
javascriptCurrency Flow:
Sale Currency → Base Currency (USD) → Payout Currency
     ↓              ↓                    ↓
  FX Rate 1    System Rate         FX Rate 2
Seller Wallet System
javascriptWallet Operations:
- credit: sales_payout, bonus, refund
- debit: advance_repayment, chargeback, fee
- hold: pending_reconciliation
- available_balance: total - holds
API Endpoints
# P&L & Analytics
GET    /api/financial/pnl              # Real-time P&L
GET    /api/financial/pnl/seller/[id]  # Seller-specific P&L
GET    /api/financial/pnl/order/[id]   # Order-level P&L
GET    /api/financial/trends           # Financial trends

# Seller Wallets
GET    /api/wallets/[sellerId]         # Wallet balance
GET    /api/wallets/[sellerId]/transactions # Transaction history
POST   /api/wallets/[sellerId]/credit  # Credit wallet
POST   /api/wallets/[sellerId]/debit   # Debit wallet

# Cash Advance
POST   /api/advances/request           # Request advance
GET    /api/advances                   # List advances
PUT    /api/advances/[id]/approve      # Approve advance
GET    /api/advances/[id]/repayment    # Repayment schedule

# Reconciliation
POST   /api/reconciliation/import      # Import settlement files
GET    /api/reconciliation/status      # Reconciliation status
PUT    /api/reconciliation/[id]/match  # Manual matching
UI Components

PnLDashboard: Real-time profit overview
SellerFinancials: Individual seller P&L
WalletInterface: Balance và transaction history
AdvanceManagement: Cash advance requests
ReconciliationCenter: Settlement matching
FinancialReports: Customizable reports

Financial Controls

Margin guardrails (minimum profit thresholds)
Advance limits based on seller performance
Multi-approval workflows for large transactions
Automated hold/release mechanisms
Currency hedging strategies (future)

Reconciliation Process
1. Import settlement files (CSV/API)
2. Parse và standardize format
3. Match với internal transactions
4. Flag discrepancies for review
5. Auto-resolve minor differences
6. Generate reconciliation reports
Database Tables

transactions, transaction_items
seller_wallets, wallet_transactions
cash_advances, advance_repayments
reconciliations, reconciliation_items
fx_rates, financial_settings