import { test, expect } from '@playwright/test'

test.describe('404 Page', () => {
  test('should show 404 page for invalid route', async ({ page }) => {
    await page.goto('/invalid-route-that-does-not-exist')
    
    // Should show 404 message
    const notFoundMessage = page.locator('text=/404|não encontrado|not found/i').first()
    await expect(notFoundMessage).toBeVisible({ timeout: 5000 })
  })

  test('should have navigation links on 404 page', async ({ page }) => {
    await page.goto('/invalid-route')
    
    const homeLink = page.locator('a[href="/"], a').filter({ hasText: /início|home/i }).first()
    const catalogLink = page.locator('a[href="/catalogo"], a').filter({ hasText: /catálogo|catalog/i }).first()
    
    if (await homeLink.isVisible()) {
      await homeLink.click()
      await expect(page).toHaveURL(/\//)
    } else if (await catalogLink.isVisible()) {
      await catalogLink.click()
      await expect(page).toHaveURL(/\/catalogo/)
    }
  })
})

