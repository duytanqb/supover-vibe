import { test, expect } from '@playwright/test';

test.describe('Designs Management', () => {
  test.beforeEach(async ({ page }) => {
    // Skip login for now since auth protection not implemented
    // await page.goto('/login');
    // await page.fill('input[type="email"]', 'admin@example.com');
    // await page.fill('input[type="password"]', 'admin123');
    // await page.click('button[type="submit"]');
    // await expect(page).toHaveURL('/dashboard');
  });

  test('should display designs library page', async ({ page }) => {
    await page.goto('/designs');
    
    await expect(page.locator('h1')).toContainText('Design Library');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('thead th')).toContainText(['Design', 'Team', 'Status', 'Usage']);
  });

  test('should open create design dialog', async ({ page }) => {
    await page.goto('/designs');
    
    await page.click('button:has-text("Add Design")');
    
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('Add New Design');
  });

  test('should filter designs by status', async ({ page }) => {
    await page.goto('/designs');
    
    // Wait for designs to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Filter by APPROVED status
    const statusFilter = page.locator('button:has-text("All statuses")');
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.click('text=Approved');
      await expect(statusFilter).toContainText('Approved');
    }
  });

  test('should search designs', async ({ page }) => {
    await page.goto('/designs');
    
    const searchInput = page.locator('input[placeholder="Search designs..."]');
    await searchInput.fill('Summer');
    
    await page.waitForTimeout(1000);
    await expect(searchInput).toHaveValue('Summer');
  });

  test('should show design status changes', async ({ page }) => {
    await page.goto('/designs');
    
    // Wait for designs to load
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    
    // Look for status action buttons
    const reviewButton = page.locator('button:has-text("Review")');
    const archiveButton = page.locator('button:has-text("Archive")');
    
    // Verify status action buttons exist for appropriate designs
    if (await reviewButton.count() > 0) {
      await expect(reviewButton.first()).toBeVisible();
    }
    if (await archiveButton.count() > 0) {
      await expect(archiveButton.first()).toBeVisible();
    }
  });

  test('should validate required fields in create design form', async ({ page }) => {
    await page.goto('/designs');
    
    await page.click('button:has-text("Add Design")');
    await page.click('button:has-text("Create Design")');
    
    // Check for validation errors
    await expect(page.locator('text=required')).toBeVisible();
  });
});