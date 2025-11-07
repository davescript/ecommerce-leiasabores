import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Leia Sabores/i)
  })

  test('should display hero section', async ({ page }) => {
    const hero = page.locator('h1, [data-testid="hero"]').first()
    await expect(hero).toBeVisible()
  })

  test('should display categories', async ({ page }) => {
    const categories = page.locator('a[href*="/catalogo"]')
    await expect(categories.first()).toBeVisible()
  })

  test('should display featured products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], article, .product-card', {
      timeout: 10000,
    })
    const products = page.locator('[data-testid="product-card"], article, .product-card')
    const count = await products.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to catalog from link', async ({ page }) => {
    const catalogLink = page.locator('a[href="/catalogo"]').first()
    await catalogLink.click()
    await expect(page).toHaveURL(/\/catalogo/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()
  })

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()
  })
})

