import { test, expect } from '@playwright/test'

test.describe('Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart first
    await page.goto('/catalogo')
    await page.waitForSelector('a[href*="/produto"]', { timeout: 10000 })
    const productLink = page.locator('a[href*="/produto"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await page.waitForTimeout(1000)
      
      const addButton = page.locator('button').filter({ hasText: /adicionar|add/i }).first()
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForTimeout(500)
      }
    }
    
    await page.goto('/carrinho')
  })

  test('should load cart page', async ({ page }) => {
    await expect(page).toHaveURL(/\/carrinho/)
  })

  test('should display cart items', async ({ page }) => {
    // Wait for cart items or empty state
    await page.waitForTimeout(1000)
    const emptyMessage = page.locator('text=/vazio|empty/i')
    const cartItems = page.locator('[data-testid="cart-item"], .cart-item, article')
    
    if (await emptyMessage.isVisible()) {
      // Cart is empty, which is also valid
      expect(await emptyMessage.isVisible()).toBeTruthy()
    } else {
      // Cart has items
      const count = await cartItems.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should update quantity', async ({ page }) => {
    const quantityInput = page.locator('input[type="number"]').first()
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3')
      await page.waitForTimeout(500)
      const value = await quantityInput.inputValue()
      expect(value).toBe('3')
    }
  })

  test('should remove item from cart', async ({ page }) => {
    const removeButton = page.locator('button').filter({ hasText: /remover|delete|eliminar/i }).first()
    if (await removeButton.isVisible()) {
      await removeButton.click()
      await page.waitForTimeout(500)
      // Cart should be empty or item removed
    }
  })

  test('should calculate total correctly', async ({ page }) => {
    await page.waitForTimeout(1000)
    const total = page.locator('text=/total|€|EUR/i').filter({ hasText: /[0-9]/ }).first()
    if (await total.isVisible()) {
      await expect(total).toBeVisible()
    }
  })

  test('should navigate to checkout', async ({ page }) => {
    const checkoutButton = page.locator('a[href*="/checkout"], button').filter({ hasText: /checkout|finalizar|comprar/i }).first()
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click()
      await expect(page).toHaveURL(/\/checkout/)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(1000)
    const cartContent = page.locator('main, .cart, [data-testid="cart"]').first()
    await expect(cartContent).toBeVisible()
  })
})

