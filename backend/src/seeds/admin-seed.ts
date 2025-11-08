import type { WorkerBindings } from '../types/bindings'
import { getDb } from '../lib/db'
import { adminUsers, storeSettings } from '../models/schema'
import { hashPassword } from '../utils/bcrypt'
import { eq } from 'drizzle-orm'

/**
 * Seed initial admin user and store settings
 */
export async function seedAdmin(env: WorkerBindings) {
  const db = getDb(env)

  try {
    // Create default admin user if it doesn't exist
    const existingAdmin = await db.query.adminUsers.findFirst({
      where: eq(adminUsers.email, 'admin@leiasabores.pt'),
    })

    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin123') // Change this in production!

      await db.insert(adminUsers).values({
        id: `admin_${Date.now()}`,
        email: 'admin@leiasabores.pt',
        name: 'Administrador',
        password: hashedPassword,
        role: 'admin',
        permissions: [
          'products:read',
          'products:write',
          'products:delete',
          'orders:read',
          'orders:write',
          'customers:read',
          'customers:write',
          'categories:read',
          'categories:write',
          'categories:delete',
          'coupons:read',
          'coupons:write',
          'coupons:delete',
          'settings:read',
          'settings:write',
          'users:read',
          'users:write',
          'users:delete',
        ],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      console.log('✅ Admin user created: admin@leiasabores.pt / admin123')
    } else {
      console.log('ℹ️ Admin user already exists')
    }

    // Create default store settings if it doesn't exist
    const existingSettings = await db.query.storeSettings.findFirst({
      where: eq(storeSettings.id, 'main'),
    })

    if (!existingSettings) {
      await db.insert(storeSettings).values({
        id: 'main',
        storeName: 'Leia Sabores',
        storeEmail: 'info@leiasabores.pt',
        currency: 'EUR',
        taxRate: 0.23, // 23% IVA
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      console.log('✅ Store settings created')
    } else {
      console.log('ℹ️ Store settings already exist')
    }

    return { success: true }
  } catch (error) {
    console.error('Error seeding admin:', error)
    throw error
  }
}

