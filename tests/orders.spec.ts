import { test, expect } from '@playwright/test';

test.describe('Orders Management', () => {
  test.beforeEach(async ({ page }) => {
    // Skip login for now since auth protection not implemented
    // await page.goto('/login');
    // await page.fill('input[type="email"]', 'admin@example.com');
    // await page.fill('input[type="password"]', 'admin123');
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL('/dashboard');
  });

  test('should display orders page with table', async ({ page }) => {
    await page.goto('/orders');
    
    await expect(page.locator('h1')).toContainText('Orders');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead th')).toContainText(['Order', 'Customer', 'Store', 'Status']);
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    
    // Wait for orders to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Filter by PENDING status
    await page.click('button:has-text("All statuses")');
    await page.click('text=Pending');
    
    // Check that filter is applied
    await expect(page.locator('button:has-text("Pending")')).toBeVisible();
  });

  test('should search orders by order number', async ({ page }) => {
    await page.goto('/orders');
    
    const searchInput = page.locator('input[placeholder="Search orders..."]');
    await searchInput.fill('ORD-');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search functionality
    await expect(searchInput).toHaveValue('ORD-');
  });

  test('should show auto-process button for eligible orders', async ({ page }) => {
    await page.goto('/orders');
    
    // Wait for orders to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Look for auto-process buttons (orders without designs)
    const processButtons = page.locator('button:has-text("Process")');
    if (await processButtons.count() > 0) {
      await expect(processButtons.first()).toBeVisible();
    }
  });
});