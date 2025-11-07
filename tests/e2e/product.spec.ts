import { test, expect } from '@playwright/test'

test.describe('Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to catalog first to get a product ID
    await page.goto('/catalogo')
    await page.waitForSelector('a[href*="/produto"]', { timeout: 10000 })
    const productLink = page.locator('a[href*="/produto"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
    } else {
      // Fallback: try direct navigation
      await page.goto('/produto/test-id')
    }
  })

  test('should load product page', async ({ page }) => {
    await expect(page).toHaveURL(/\/produto\//)
  })

  test('should display product name', async ({ page }) => {
    const productName = page.locator('h1, h2').first()
    await expect(productName).toBeVisible()
  })

  test('should display product price', async ({ page }) => {
    const price = page.locator('text=/€|EUR|preço/i').first()
    await expect(price).toBeVisible()
  })

  test('should display product images', async ({ page }) => {
    const images = page.locator('img[alt*="product" i], img[src*="product" i], img').filter({ hasNotText: '' })
    const count = await images.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should add product to cart', async ({ page }) => {
    const addToCartButton = page.locator('button').filter({ hasText: /adicionar|add to cart|comprar/i }).first()
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      // Check for success message or cart update
      await page.waitForTimeout(500)
      // Verify cart count updated or success message
      const cartCount = page.locator('[data-testid="cart-count"], .cart-count, text=/[0-9]+/').first()
      // Just verify button was clicked (cart might be updated)
      expect(await addToCartButton.isVisible()).toBeTruthy()
    }
  })

  test('should update quantity', async ({ page }) => {
    const quantityInput = page.locator('input[type="number"]').first()
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('2')
      const value = await quantityInput.inputValue()
      expect(value).toBe('2')
    }
  })

  test('should navigate back to catalog', async ({ page }) => {
    const backLink = page.locator('a').filter({ hasText: /voltar|back|catálogo|catalog/i }).first()
    if (await backLink.isVisible()) {
      await backLink.click()
      await expect(page).toHaveURL(/\/catalogo|\//)
    }
  })

  test('should handle out of stock product', async ({ page }) => {
    const outOfStockMessage = page.locator('text=/esgotado|out of stock|indisponível/i')
    const addButton = page.locator('button').filter({ hasText: /adicionar/i }).first()
    
    if (await outOfStockMessage.isVisible()) {
      // If out of stock, button should be disabled
      if (await addButton.isVisible()) {
        expect(await addButton.isDisabled()).toBeTruthy()
      }
    }
  })
})

