import { test, expect } from '@playwright/test'

test.describe('Cash Advance Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller
    await page.goto('/login')
    await page.fill('input[name="email"]', 'seller@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('Seller can request cash advance', async ({ page }) => {
    // Navigate to advances page
    await page.goto('/advances')
    
    // Click request advance button
    await page.click('button:has-text("Request Advance")')
    
    // Fill advance form
    await page.selectOption('select[name="type"]', 'FULFILLMENT')
    await page.fill('input[name="amount"]', '1500')
    await page.fill('input[name="reason"]', 'Q1 2024 inventory purchase')
    await page.fill('textarea[name="notes"]', 'Expected high demand for seasonal products')
    
    // Submit request
    await page.click('button:has-text("Submit Request")')
    
    // Verify success
    await expect(page.locator('.toast-success')).toContainText('Advance request submitted')
    
    // Check if advance appears in list
    await expect(page.locator('table')).toContainText('ADV-')
    await expect(page.locator('table')).toContainText('PENDING')
    await expect(page.locator('table')).toContainText('$1,500.00')
  })

  test('Seller cannot exceed credit limit', async ({ page }) => {
    await page.goto('/advances')
    await page.click('button:has-text("Request Advance")')
    
    // Try to request amount exceeding limit
    await page.fill('input[name="amount"]', '10000')
    await page.fill('input[name="reason"]', 'Large order')
    await page.click('button:has-text("Submit Request")')
    
    // Should show error
    await expect(page.locator('.toast-error')).toContainText('exceeds available credit')
  })

  test('Seller can view advance details', async ({ page }) => {
    await page.goto('/advances')
    
    // Click view button on first advance
    await page.click('table button:has-text("View"):first')
    
    // Check details modal
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('[role="dialog"]')).toContainText('Advance Details')
    await expect(page.locator('[role="dialog"]')).toContainText('Type')
    await expect(page.locator('[role="dialog"]')).toContainText('Status')
    await expect(page.locator('[role="dialog"]')).toContainText('Amount')
  })

  test('Seller can see wallet summary', async ({ page }) => {
    await page.goto('/advances')
    
    // Check wallet cards
    await expect(page.locator('.card')).toContainText('Available Credit')
    await expect(page.locator('.card')).toContainText('Outstanding')
    await expect(page.locator('.card')).toContainText('Total Repaid')
    await expect(page.locator('.card')).toContainText('Profit Share')
  })
})

test.describe('Admin Advance Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('Admin can approve advance', async ({ page }) => {
    await page.goto('/admin/advances')
    
    // Find pending advance
    await page.click('button:has-text("Pending")')
    
    // Click approve button
    await page.click('button[aria-label="Approve"]:first')
    
    // Add approval notes
    await page.fill('textarea[name="notes"]', 'Approved for Q1 inventory')
    await page.click('button:has-text("Approve Advance")')
    
    // Verify status change
    await expect(page.locator('.toast-success')).toContainText('Advance approved')
    
    // Check approved tab
    await page.click('button:has-text("Approved")')
    await expect(page.locator('table')).toContainText('APPROVED')
  })

  test('Admin can reject advance', async ({ page }) => {
    await page.goto('/admin/advances')
    
    // Find pending advance
    await page.click('button:has-text("Pending")')
    
    // Click reject button
    await page.click('button[aria-label="Reject"]:first')
    
    // Add rejection reason
    await page.fill('textarea[name="rejectionNote"]', 'Insufficient documentation')
    await page.click('button:has-text("Reject Advance")')
    
    // Verify rejection
    await expect(page.locator('.toast-success')).toContainText('Advance rejected')
  })

  test('Admin can disburse approved advance', async ({ page }) => {
    await page.goto('/admin/advances')
    
    // Navigate to approved tab
    await page.click('button:has-text("Approved")')
    
    // Click disburse button
    await page.click('button[aria-label="Disburse"]:first')
    
    // Confirm disbursement
    await page.fill('textarea[name="notes"]', 'Funds transferred to seller account')
    await page.click('button:has-text("Disburse Funds")')
    
    // Verify disbursement
    await expect(page.locator('.toast-success')).toContainText('Funds disbursed')
    
    // Check active tab
    await page.click('button:has-text("Active")')
    await expect(page.locator('table')).toContainText('DISBURSED')
  })

  test('Admin can view advance statistics', async ({ page }) => {
    await page.goto('/admin/advances')
    
    // Check stat cards
    await expect(page.locator('.card')).toContainText('Pending Review')
    await expect(page.locator('.card')).toContainText('Approved')
    await expect(page.locator('.card')).toContainText('Active')
    await expect(page.locator('.card')).toContainText('Outstanding')
    
    // Verify counts are displayed
    const pendingCard = page.locator('.card:has-text("Pending Review")')
    await expect(pendingCard.locator('.text-2xl')).toHaveText(/\d+/)
  })
})

test.describe('Navigation and Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
  })

  test('Finance submenu expands and shows all options', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click Finance menu
    await page.click('button:has-text("Finance")')
    
    // Check all submenu items are visible
    await expect(page.locator('a:has-text("Cash Advances")')).toBeVisible()
    await expect(page.locator('a:has-text("Admin Advances")')).toBeVisible()
    await expect(page.locator('a:has-text("Wallets")')).toBeVisible()
    await expect(page.locator('a:has-text("Transactions")')).toBeVisible()
    await expect(page.locator('a:has-text("Profit Sharing")')).toBeVisible()
  })

  test('Breadcrumbs show correct navigation path', async ({ page }) => {
    await page.goto('/admin/advances')
    
    // Check breadcrumbs
    await expect(page.locator('.breadcrumb')).toContainText('Finance')
    await expect(page.locator('.breadcrumb')).toContainText('Admin Advances')
  })

  test('Active menu item is highlighted', async ({ page }) => {
    await page.goto('/advances')
    
    // Finance menu should be expanded
    await expect(page.locator('a:has-text("Cash Advances")')).toBeVisible()
    
    // Cash Advances should be highlighted
    const activeItem = page.locator('a:has-text("Cash Advances")')
    await expect(activeItem).toHaveClass(/bg-gray-800/)
  })
})

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('Mobile menu toggles correctly', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Menu should be hidden initially
    await expect(page.locator('.sidebar')).not.toBeVisible()
    
    // Click menu button
    await page.click('button[aria-label="Menu"]')
    
    // Menu should be visible
    await expect(page.locator('.sidebar')).toBeVisible()
    
    // Click outside to close
    await page.click('body', { position: { x: 350, y: 100 } })
    
    // Menu should be hidden again
    await expect(page.locator('.sidebar')).not.toBeVisible()
  })

  test('Forms are usable on mobile', async ({ page }) => {
    await page.goto('/advances')
    
    // Open request form
    await page.click('button:has-text("Request Advance")')
    
    // Modal should be full screen on mobile
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
    
    // Form elements should be accessible
    await page.fill('input[name="amount"]', '500')
    await page.selectOption('select[name="type"]', 'RESOURCE')
    
    // Can scroll to submit button
    await page.click('button:has-text("Submit Request")')
  })
})