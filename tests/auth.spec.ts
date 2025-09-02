import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should allow access to orders page without auth (for now)', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL('/orders');
    await expect(page.locator('h1')).toContainText('Orders');
  });
});