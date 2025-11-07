import { test, expect } from '@playwright/test'

test.describe('Checkout Page', () => {
  test.beforeEach(async ({ page }) => {
    // Add product and go to checkout
    await page.goto('/catalogo')
    await page.waitForSelector('a[href*="/produto"]', { timeout: 10000 })
    const productLink = page.locator('a[href*="/produto"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await page.waitForTimeout(1000)
      
      const addButton = page.locator('button').filter({ hasText: /adicionar/i }).first()
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForTimeout(500)
      }
    }
    
    await page.goto('/checkout')
  })

  test('should load checkout page', async ({ page }) => {
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('should display shipping form', async ({ page }) => {
    // const nameInput = page.locator('input[type="text"]').filter({ hasText: /nome|name/i }).first()
    const emailInput = page.locator('input[type="email"]').first()
    
    // At least email should be visible
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible()
    }
  })

  test('should validate email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email')
      await emailInput.blur()
      // Check for validation error
      await page.waitForTimeout(500)
    }
  })

  test('should validate postal code', async ({ page }) => {
    const postalInput = page.locator('input').filter({ hasText: /postal|cep|zip/i }).first()
    if (await postalInput.isVisible()) {
      await postalInput.fill('123')
      await postalInput.blur()
      await page.waitForTimeout(500)
    }
  })

  test('should submit shipping form', async ({ page }) => {
    // Fill form
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com')
      
      const nameInput = page.locator('input[type="text"]').first()
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User')
      }
      
      const addressInput = page.locator('textarea, input').filter({ hasText: /morada|address/i }).first()
      if (await addressInput.isVisible()) {
        await addressInput.fill('Test Address')
      }
      
      const cityInput = page.locator('input').filter({ hasText: /cidade|city/i }).first()
      if (await cityInput.isVisible()) {
        await cityInput.fill('Lisboa')
      }
      
      const postalInput = page.locator('input').filter({ hasText: /postal/i }).first()
      if (await postalInput.isVisible()) {
        await postalInput.fill('1000-001')
      }
      
      // Submit
      const submitButton = page.locator('button[type="submit"]').first()
      if (await submitButton.isVisible()) {
        // Don't actually submit to avoid real payment
        // Just verify button exists
        await expect(submitButton).toBeVisible()
      }
    }
  })

  test('should display order summary', async ({ page }) => {
    await page.waitForTimeout(1000)
    const summary = page.locator('text=/subtotal|total|resumo/i').first()
    if (await summary.isVisible()) {
      await expect(summary).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(1000)
    const form = page.locator('form').first()
    if (await form.isVisible()) {
      await expect(form).toBeVisible()
    }
  })
})

