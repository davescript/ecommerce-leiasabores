import { test, expect } from '../fixtures/admin-auth'
import { AdminAPIHelper } from '../helpers/api-helpers'
import { AdminPageHelper } from '../helpers/page-helpers'

test.describe('Clientes', () => {
  test('deve listar clientes', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const pageHelper = new AdminPageHelper(adminPage)

    await pageHelper.goToCustomers()
    await pageHelper.waitForLoading()

    const customers = await apiHelper.listCustomers()
    expect(customers).toBeDefined()
    expect(customers.customers).toBeDefined()
  })

  test('deve editar cliente', async ({ adminPage, adminApi, adminToken }) => {
    const apiHelper = new AdminAPIHelper(adminApi, process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api', adminToken)
    const customers = await apiHelper.listCustomers()

    if (customers.customers?.length > 0) {
      const customer = customers.customers[0]
      const newName = `Cliente Editado ${Date.now()}`
      await apiHelper.updateCustomer(customer.id, { name: newName })
      
      const updated = await apiHelper.getCustomer?.(customer.id)
      expect(updated?.name).toBe(newName)
    }
  })
})

