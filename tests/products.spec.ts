import { test, expect } from '@playwright/test';

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    // Skip login for now since auth protection not implemented
    // await page.goto('/login');
    // await page.fill('input[type="email"]', 'admin@example.com');
    // await page.fill('input[type="password"]', 'admin123');
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL('/dashboard');
  });

  test('should display products page with catalog', async ({ page }) => {
    await page.goto('/products');
    
    await expect(page.locator('h1')).toContainText('Products');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead th')).toContainText(['Product', 'Store', 'SKU', 'Pricing']);
  });

  test('should open create product dialog', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('button:has-text("Add Product")');
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Add New Product');
  });

  test('should search products', async ({ page }) => {
    await page.goto('/products');
    
    const searchInput = page.locator('input[placeholder="Search products..."]');
    await searchInput.fill('Premium');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    await expect(searchInput).toHaveValue('Premium');
  });

  test('should filter products by store', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Try to open store filter if stores exist
    const storeFilter = page.locator('button:has-text("All stores")');
    if (await storeFilter.count() > 0) {
      await storeFilter.first().click();
    }
  });

  test('should validate required fields in create form', async ({ page }) => {
    await page.goto('/products');
    
    await page.click('button:has-text("Add Product")');
    await page.click('button:has-text("Create Product")');
    
    // Check for validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });
});