import { test, expect } from '../fixtures/admin-auth'
import { AdminPageHelper } from '../helpers/page-helpers'

test.describe('Dark Mode', () => {
  test('deve alternar dark mode', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToDashboard()

    // Verificar estado inicial
    const initialDarkMode = await pageHelper.isDarkMode()

    // Alternar dark mode
    await pageHelper.toggleDarkMode()

    // Verificar que mudou
    const afterToggle = await pageHelper.isDarkMode()
    expect(afterToggle).toBe(!initialDarkMode)

    // Alternar novamente
    await pageHelper.toggleDarkMode()

    // Verificar que voltou ao estado inicial
    const finalDarkMode = await pageHelper.isDarkMode()
    expect(finalDarkMode).toBe(initialDarkMode)
  })

  test('deve persistir dark mode após reload', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToDashboard()

    // Ativar dark mode
    if (!(await pageHelper.isDarkMode())) {
      await pageHelper.toggleDarkMode()
    }

    const isDarkBefore = await pageHelper.isDarkMode()
    expect(isDarkBefore).toBe(true)

    // Reload
    await adminPage.reload()
    await pageHelper.waitForAdminLoad()

    // Verificar que dark mode persiste
    const isDarkAfter = await pageHelper.isDarkMode()
    expect(isDarkAfter).toBe(true)
  })
})

