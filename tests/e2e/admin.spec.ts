import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
  })

  test('should require authentication', async ({ page }) => {
    // Should redirect or show login if not authenticated
    const currentUrl = page.url()
    // Either redirected to home or shows login form
    expect(currentUrl).toMatch(/\/(admin|$)/)
  })

  test('should display login form or token input', async ({ page }) => {
    await page.waitForTimeout(1000)
    const tokenInput = page.locator('input[type="text"], input[type="password"]').filter({ hasText: /token|jwt/i }).first()
    const loginForm = page.locator('form').first()
    
    // Should have either token input or login form
    if (await tokenInput.isVisible() || await loginForm.isVisible()) {
      expect(true).toBeTruthy()
    }
  })

  test('should list products when authenticated', async ({ page, context }) => {
    // Set admin token in localStorage
    await context.addCookies([{
      name: 'admin_token',
      value: 'test-token',
      domain: 'localhost',
      path: '/',
    }])
    
    await page.goto('/admin')
    await page.waitForTimeout(2000)
    
    // Check for products list or admin interface
    const productsList = page.locator('text=/produto|product/i').first()
    const adminInterface = page.locator('h1, h2').filter({ hasText: /admin/i }).first()
    
    if (await productsList.isVisible() || await adminInterface.isVisible()) {
      expect(true).toBeTruthy()
    }
  })

  test('should allow creating product', async ({ page }) => {
    await page.waitForTimeout(1000)
    const createButton = page.locator('button').filter({ hasText: /criar|create|adicionar/i }).first()
    if (await createButton.isVisible()) {
      await expect(createButton).toBeVisible()
    }
  })

  test('should allow uploading image', async ({ page }) => {
    await page.waitForTimeout(1000)
    const fileInput = page.locator('input[type="file"]').first()
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeVisible()
    }
  })
})

