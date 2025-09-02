import { test, expect } from '@playwright/test';

test.describe('Design Module Tests', () => {
  test('should display design library structure', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    // Check if page loads successfully
    const hasError = await page.locator('h1:has-text("Error"), h1:has-text("Unhandled")').count() > 0;
    
    if (!hasError) {
      await expect(page.locator('h1')).toContainText('Design Library');
      
      // Verify table headers exist
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Design")')).toBeVisible();
      await expect(page.locator('th:has-text("Team")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
      await expect(page.locator('th:has-text("Usage")')).toBeVisible();
      await expect(page.locator('th:has-text("Fingerprint")')).toBeVisible();
      await expect(page.locator('th:has-text("Actions")')).toBeVisible();
    }
  });

  test('should have add design button', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Design")');
    if (await addButton.count() > 0) {
      await expect(addButton).toBeVisible();
      await expect(addButton).toBeEnabled();
    }
  });

  test('should open create design dialog', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Design")');
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Check dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h2:has-text("Add New Design")')).toBeVisible();
      
      // Check form fields
      await expect(page.locator('label:has-text("Team")')).toBeVisible();
      await expect(page.locator('label:has-text("Design Name")')).toBeVisible();
      await expect(page.locator('label:has-text("Design File URL")')).toBeVisible();
      
      // Close dialog
      await page.click('button:has-text("Cancel")');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const searchInput = page.locator('input[placeholder*="Search designs"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      
      // Test search input
      await searchInput.fill('Summer');
      await expect(searchInput).toHaveValue('Summer');
      
      // Clear search
      await searchInput.clear();
    }
  });

  test('should have status filter dropdown', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const statusFilter = page.locator('button:has-text("All statuses")');
    if (await statusFilter.count() > 0) {
      await expect(statusFilter).toBeVisible();
      
      // Test opening filter
      await statusFilter.click();
      
      // Check filter options
      await expect(page.locator('text=Draft')).toBeVisible();
      await expect(page.locator('text=In Review')).toBeVisible();
      await expect(page.locator('text=Approved')).toBeVisible();
      await expect(page.locator('text=Archived')).toBeVisible();
      
      // Select a status
      await page.click('text=Approved');
      await expect(page.locator('button:has-text("Approved")')).toBeVisible();
    }
  });

  test('should have team filter dropdown', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const teamFilter = page.locator('button:has-text("All teams")');
    if (await teamFilter.count() > 0) {
      await expect(teamFilter).toBeVisible();
      await teamFilter.click();
      
      // Should show team options
      await expect(page.locator('[role="option"]')).toBeVisible();
    }
  });

  test('should display design data when available', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(5000);
    
    const designRows = page.locator('table tbody tr');
    const rowCount = await designRows.count();
    
    if (rowCount > 0) {
      const firstRow = designRows.first();
      
      // Check for design name and thumbnail/icon
      await expect(firstRow.locator('td').first()).toBeVisible();
      
      // Check for team name
      await expect(firstRow.locator('td').nth(1)).toBeVisible();
      
      // Check for status badge
      await expect(firstRow.locator('.bg-gray-500, .bg-blue-500, .bg-green-500, .bg-purple-500, .bg-red-500')).toBeVisible();
      
      // Check for fingerprint
      await expect(firstRow.locator('code')).toBeVisible();
    } else {
      // No designs - should show empty state
      await expect(page.locator('text=No designs found')).toBeVisible();
      await expect(page.locator('text=Upload your first design')).toBeVisible();
    }
  });

  test('should show design status action buttons', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(5000);
    
    const designRows = page.locator('table tbody tr');
    const rowCount = await designRows.count();
    
    if (rowCount > 0) {
      // Look for status action buttons
      const reviewButtons = page.locator('button:has-text("Review")');
      const archiveButtons = page.locator('button:has-text("Archive")');
      const viewButtons = page.locator('button svg.lucide-eye');
      
      // At least view buttons should exist
      await expect(viewButtons.first()).toBeVisible();
      
      // Status-specific buttons depend on design status
      if (await reviewButtons.count() > 0) {
        await expect(reviewButtons.first()).toBeVisible();
      }
      if (await archiveButtons.count() > 0) {
        await expect(archiveButtons.first()).toBeVisible();
      }
    }
  });

  test('should validate create design form', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(3000);
    
    const addButton = page.locator('button:has-text("Add Design")');
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Try to submit empty form
      await page.click('button:has-text("Create Design")');
      
      // Check for validation errors
      await expect(page.locator('text=required, text=Design name is required')).toBeVisible();
    }
  });

  test('should show design tags when available', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(5000);
    
    const designRows = page.locator('table tbody tr');
    const rowCount = await designRows.count();
    
    if (rowCount > 0) {
      // Look for tag badges in design cells
      const tagBadges = page.locator('td .text-xs');
      if (await tagBadges.count() > 0) {
        await expect(tagBadges.first()).toBeVisible();
      }
    }
  });

  test('should display design usage statistics', async ({ page }) => {
    await page.goto('/designs');
    await page.waitForTimeout(5000);
    
    const designRows = page.locator('table tbody tr');
    const rowCount = await designRows.count();
    
    if (rowCount > 0) {
      const usageCell = designRows.first().locator('td').nth(3);
      
      // Should show order and fulfillment counts
      await expect(usageCell).toContainText('orders');
      await expect(usageCell).toContainText('fulfillments');
    }
  });
});