import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'
import { TEST_COUPON, generateTestCouponCode } from '../helpers/test-data'

test.describe('Cupons CRUD', () => {
  test('deve criar cupom válido', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToCoupons()
    await pageHelper.clickButton(/novo|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal, form', { timeout: 5000 })

    const code = generateTestCouponCode()
    await pageHelper.fillInput('Código', code)
    await pageHelper.selectOption('Tipo', 'Porcentagem')
    await pageHelper.fillInput('Valor', '10')
    await pageHelper.fillInput('Valor Mínimo', '50')
    await pageHelper.saveForm()

    await adminPage.waitForTimeout(2000)
    await expect(adminPage.getByText(code)).toBeVisible({ timeout: 10000 })

    const coupons = await apiHelper.listCoupons()
    const created = coupons.coupons?.find((c: any) => c.code === code)
    expect(created).toBeTruthy()

    if (created) await apiHelper.deleteCoupon(created.id)
  })

  test('deve validar datas de cupom', async ({ adminPage }) => {
    const pageHelper = new AdminPageHelper(adminPage)
    await pageHelper.goToCoupons()
    await pageHelper.clickButton(/novo|criar|create/i)
    await adminPage.waitForSelector('[role="dialog"], .modal', { timeout: 5000 })

    const code = generateTestCouponCode()
    await pageHelper.fillInput('Código', code)
    await pageHelper.selectOption('Tipo', 'Porcentagem')
    await pageHelper.fillInput('Valor', '10')
    // Data de expiração antes da data de início
    await pageHelper.fillInput('Data Início', new Date(Date.now() + 86400000).toISOString().split('T')[0])
    await pageHelper.fillInput('Data Fim', new Date().toISOString().split('T')[0])
    await pageHelper.clickButton('Salvar')

    await pageHelper.waitForErrorToast(/data|expiração|posterior/i)
  })
})

