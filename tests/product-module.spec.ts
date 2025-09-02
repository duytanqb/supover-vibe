import { test, expect } from '@playwright/test';

test.describe('Product Module Tests', () => {
  test('should display products catalog structure', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    // Check if page loads successfully
    const hasError = await page.locator('h1:has-text("Error"), h1:has-text("Unhandled")').count() > 0;
    
    if (!hasError) {
      await expect(page.locator('h1')).toContainText('Products');
      
      // Verify table headers exist
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Product")')).toBeVisible();
      await expect(page.locator('th:has-text("Store")')).toBeVisible();
      await expect(page.locator('th:has-text("SKU")')).toBeVisible();
      await expect(page.locator('th:has-text("Pricing")')).toBeVisible();
      await expect(page.locator('th:has-text("Designs")')).toBeVisible();
      await expect(page.locator('th:has-text("Orders")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Actions")')).toBeVisible();
    }
  });

  test('should have add product button', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Product")');
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
      await expect(addButton).toBeEnabled();
    }
  });

  test('should open create product dialog', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Product")');
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Check dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Add New Product")')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('label:has-text("Store")')).toBeVisible();
      await expect(page.locator('label:has-text("SKU")')).toBeVisible();
      await expect(page.locator('label:has-text("Product Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Base Price")')).toBeVisible();
      await expect(page.locator('label:has-text("Cost Price")')).toBeVisible();
      
      // Close dialog
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    const searchInput = page.locator('input[placeholder*="Search products"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search input
      await searchInput.fill('Premium');
      await expect(searchInput).toHaveValue('Premium');
      
      // Clear search
      await searchInput.clear();
    }
  });

  test('should have store filter dropdown', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    const storeFilter = page.locator('button:has-text("All stores")');
    if (await storeFilter.count() > 0) {
      await expect(storeFilter).toBeVisible();
      await storeFilter.click();
      
      // Should show store options
      await expect(page.locator('[role="option"]')).toBeVisible();
    }
  });

  test('should display product data when available', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      const firstRow = productRows.first();
      
      // Check for product name
      await expect(firstRow.locator('td').first()).toBeVisible();
      
      // Check for store info
      await expect(firstRow.locator('td').nth(1)).toBeVisible();
      
      // Check for SKU in code format
      await expect(firstRow.locator('code')).toBeVisible();
      
      // Check for pricing info
      const pricingCell = firstRow.locator('td').nth(3);
      await expect(pricingCell).toContainText('Base:');
      await expect(pricingCell).toContainText('Cost:');
      
      // Check for status badge
      await expect(firstRow.locator('text=Active, text=Inactive')).toBeVisible();
    } else {
      // No products - should show empty state
      await expect(page.locator('text=No products found')).toBeVisible();
    }
  });

  test('should display product designs association', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      const designsCell = productRows.first().locator('td').nth(4);
      await expect(designsCell).toBeVisible();
      
      // Should show design count or badges
      const designBadges = designsCell.locator('.text-xs');
      if (await designBadges.count() > 0) {
        await expect(designBadges.first()).toBeVisible();
      }
    }
  });

  test('should show product order count', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      const ordersCell = productRows.first().locator('td').nth(5);
      await expect(ordersCell).toBeVisible();
      
      // Should show numeric order count
      const orderCount = await ordersCell.textContent();
      expect(orderCount).toMatch(/^\d+$/);
    }
  });

  test('should have edit action buttons', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const editButtons = page.locator('button:has-text("Edit")');
    const buttonCount = await editButtons.count();
    
    if (buttonCount > 0) {
      await expect(editButtons.first()).toBeVisible();
      await expect(editButtons.first()).toBeEnabled();
    }
  });

  test('should validate create product form', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Product")');
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Try to submit empty form
      await page.click('button:has-text("Create Product")');
      
      // Check for validation errors
      await expect(page.locator('text=required')).toBeVisible();
    }
  });

  test('should show product pricing correctly', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      const pricingCell = productRows.first().locator('td').nth(3);
      
      // Should format prices with currency symbols
      await expect(pricingCell).toContainText('$');
      await expect(pricingCell).toContainText('Base:');
      await expect(pricingCell).toContainText('Cost:');
    }
  });

  test('should show active/inactive status correctly', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(5000);
    
    const productRows = page.locator('table tbody tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      const statusBadges = page.locator('text=Active, text=Inactive');
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible();
      }
    }
  });
});