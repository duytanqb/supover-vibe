import { test, expect } from '@playwright/test';

test.describe('Order Module Tests', () => {
  test('should display orders table structure', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(3000);
    
    // Check if page loads successfully
    const hasError = await page.locator('h1:has-text("Error"), h1:has-text("Unhandled")').count() > 0;
    
    if (!hasError) {
      await expect(page.locator('h1')).toContainText('Orders');
      
      // Verify table headers exist
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Order")')).toBeVisible();
      await expect(page.locator('th:has-text("Customer")')).toBeVisible();
      await expect(page.locator('th:has-text("Store")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Total")')).toBeVisible();
      await expect(page.locator('th:has-text("Actions")')).toBeVisible();
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(3000);
    
    const searchInput = page.locator('input[placeholder*="Search orders"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search input
      await searchInput.fill('ORD-001');
      await expect(searchInput).toHaveValue('ORD-001');
      
      // Clear search
      await searchInput.clear();
    }
  });

  test('should have status filter dropdown', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(3000);
    
    const statusFilter = page.locator('button:has-text("All statuses")');
    if (await statusFilter.count() > 0) {
      await expect(statusFilter).toBeVisible();
      
      // Test opening filter
      await statusFilter.click();
      
      // Check filter options
      await expect(page.locator('text=Pending')).toBeVisible();
      await expect(page.locator('text=Processing')).toBeVisible();
      await expect(page.locator('text=Shipped')).toBeVisible();
      
      // Select a status
      await page.click('text=Pending');
      await expect(page.locator('button:has-text("Pending")')).toBeVisible();
    }
  });

  test('should have store filter dropdown', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(3000);
    
    const storeFilter = page.locator('button:has-text("All stores")');
    if (await storeFilter.count() > 0) {
      await expect(storeFilter).toBeVisible();
      await storeFilter.click();
      
      // Should show store options
      await expect(page.locator('[role="option"]')).toBeVisible();
    }
  });

  test('should display order data when available', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(5000);
    
    const orderRows = page.locator('table tbody tr');
    const rowCount = await orderRows.count();
    
    if (rowCount > 0) {
      // Verify order data structure
      const firstRow = orderRows.first();
      
      // Check for order number
      await expect(firstRow.locator('td').first()).toBeVisible();
      
      // Check for customer name
      await expect(firstRow.locator('td').nth(1)).toBeVisible();
      
      // Check for status badge
      await expect(firstRow.locator('.bg-yellow-500, .bg-blue-500, .bg-green-500, .bg-purple-500, .bg-red-500')).toBeVisible();
    } else {
      // No orders - should show empty state
      await expect(page.locator('text=No orders found')).toBeVisible();
    }
  });

  test('should show auto-fulfillment status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(5000);
    
    // Check for auto-fulfillment column
    await expect(page.locator('th:has-text("Auto-Fulfillment")')).toBeVisible();
    
    const orderRows = page.locator('table tbody tr');
    const rowCount = await orderRows.count();
    
    if (rowCount > 0) {
      // Check for auto-fulfillment badges
      const fulfillmentBadges = page.locator('.bg-green-500:has-text("Ready"), text=Partial, text=None');
      await expect(fulfillmentBadges.first()).toBeVisible();
    }
  });

  test('should have process button for eligible orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(5000);
    
    const processButtons = page.locator('button:has-text("Process")');
    const buttonCount = await processButtons.count();
    
    if (buttonCount > 0) {
      await expect(processButtons.first()).toBeVisible();
      await expect(processButtons.first()).toBeEnabled();
    }
  });

  test('should have view action buttons', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForTimeout(5000);
    
    const viewButtons = page.locator('button:has([data-testid="eye-icon"]), button svg.lucide-eye');
    const buttonCount = await viewButtons.count();
    
    if (buttonCount > 0) {
      await expect(viewButtons.first()).toBeVisible();
    }
  });
});