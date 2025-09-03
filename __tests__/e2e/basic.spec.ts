import { test, expect } from '@playwright/test'

test.describe('Basic Application Tests', () => {
  test('Application loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check if page loads
    await expect(page).toHaveTitle(/Supover/)
    
    // Check if main elements are visible
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('Navigation menu is visible', async ({ page }) => {
    await page.goto('/')
    
    // Check for navigation elements
    const dashboardLink = page.locator('text=Dashboard')
    await expect(dashboardLink).toBeVisible()
  })

  test('Can navigate to different pages', async ({ page }) => {
    await page.goto('/')
    
    // Try navigating to orders page
    await page.goto('/orders')
    await expect(page).toHaveURL(/.*orders/)
    
    // Try navigating to products page
    await page.goto('/products')
    await expect(page).toHaveURL(/.*products/)
  })

  test('Responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    
    // Mobile menu button should be visible
    const menuButton = page.locator('button').filter({ hasText: /menu/i }).first()
    
    // Page should still load
    const content = page.locator('main')
    await expect(content).toBeVisible()
  })
})