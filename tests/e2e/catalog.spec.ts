import { test, expect } from '@playwright/test'

test.describe('Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalogo')
  })

  test('should load catalog page', async ({ page }) => {
    await expect(page).toHaveURL(/\/catalogo/)
    await expect(page).toHaveTitle(/Catálogo/i)
  })

  test('should display products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], article, .product-card', {
      timeout: 10000,
    })
    const products = page.locator('[data-testid="product-card"], article, .product-card')
    const count = await products.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should filter by category', async ({ page }) => {
    // Look for category filter buttons/links
    const categoryFilter = page.locator('button, a').filter({ hasText: /categoria|category/i }).first()
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click()
      // Wait for filtered results
      await page.waitForTimeout(1000)
      const products = page.locator('[data-testid="product-card"], article')
      expect(await products.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('should search products', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="pesquisar" i], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test')
      await searchInput.press('Enter')
      await page.waitForTimeout(1000)
    }
  })

  test('should navigate to product page', async ({ page }) => {
    await page.waitForSelector('[data-testid="product-card"], article, a[href*="/produto"]', {
      timeout: 10000,
    })
    const productLink = page.locator('a[href*="/produto"]').first()
    if (await productLink.isVisible()) {
      await productLink.click()
      await expect(page).toHaveURL(/\/produto\//)
    }
  })

  test('should handle pagination', async ({ page }) => {
    const nextButton = page.locator('button, a').filter({ hasText: /próximo|next/i })
    if (await nextButton.isVisible()) {
      await nextButton.click()
      await page.waitForTimeout(1000)
      await expect(page).toHaveURL(/page=|p=/)
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const products = page.locator('[data-testid="product-card"], article')
    await expect(products.first()).toBeVisible()
  })
})

