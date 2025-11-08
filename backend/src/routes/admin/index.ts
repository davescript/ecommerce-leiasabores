import { Hono } from 'hono'
import type { WorkerBindings } from '../../types/bindings'
import { AdminJWTPayload } from '../../middleware/adminAuth'
import authRoutes from './auth'
import dashboardRoutes from './dashboard'
import productsRoutes from './products'
import productsUploadRoutes from './products-upload'
import ordersRoutes from './orders'
import customersRoutes from './customers'
import categoriesRoutes from './categories'
import couponsRoutes from './coupons'
import settingsRoutes from './settings'
import usersRoutes from './users'
import seedRoutes from './seed'

const admin = new Hono<{ Bindings: WorkerBindings; Variables: { adminUser?: AdminJWTPayload } }>()

// Admin routes
admin.route('/auth', authRoutes)
admin.route('/dashboard', dashboardRoutes)
admin.route('/products', productsRoutes)
admin.route('/products', productsUploadRoutes) // Upload routes
admin.route('/orders', ordersRoutes)
admin.route('/customers', customersRoutes)
admin.route('/categories', categoriesRoutes)
admin.route('/coupons', couponsRoutes)
admin.route('/settings', settingsRoutes)
admin.route('/users', usersRoutes)
admin.route('/seed', seedRoutes) // Seed routes (only in dev/test)

export default admin

