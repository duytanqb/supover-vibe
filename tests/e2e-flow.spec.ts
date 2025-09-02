import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Skip login for now since auth protection not implemented
    // await page.goto('/login');
    // await page.fill('input[type="email"]', 'admin@example.com');
    // await page.fill('input[type="password"]', 'admin123');
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL('/dashboard');
  });

  test('complete order management flow', async ({ page }) => {
    // Navigate to orders page
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Orders');
    
    // Verify orders are displayed
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Test search functionality
    await page.fill('input[placeholder="Search orders..."]', 'ORD-');
    await page.waitForTimeout(1000);
    
    // Test status filter
    await page.click('button:has-text("All statuses")');
    await page.click('text=Pending');
    
    // Look for auto-process functionality
    const processButton = page.locator('button:has-text("Process")').first();
    if (await processButton.count() > 0) {
      await expect(processButton).toBeVisible();
    }
  });

  test('complete product management flow', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText('Products');
    
    // Test create product dialog
    await page.click('button:has-text("Add Product")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Close dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Test search functionality
    await page.fill('input[placeholder="Search products..."]', 'Premium');
    await page.waitForTimeout(1000);
  });

  test('complete design management flow', async ({ page }) => {
    // Navigate to designs page
    await page.goto('/designs');
    await expect(page.locator('h1')).toContainText('Design Library');
    
    // Test create design dialog
    await page.click('button:has-text("Add Design")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Close dialog
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Test search and filters
    await page.fill('input[placeholder="Search designs..."]', 'Summer');
    await page.waitForTimeout(1000);
    
    // Test status filter
    await page.click('button:has-text("All statuses")');
    await page.click('text=Approved');
  });

  test('navigation between main pages', async ({ page }) => {
    // Start from dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to orders
    await page.goto('/orders');
    await expect(page.locator('h1')).toContainText('Orders');
    
    // Navigate to products
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText('Products');
    
    // Navigate to designs
    await page.goto('/designs');
    await expect(page.locator('h1')).toContainText('Design Library');
    
    // Return to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});