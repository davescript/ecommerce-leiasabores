import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  category: text('category').notNull(), // Legacy: main category
  images: text('images', { mode: 'json' }).$type<string[] | null>(),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  inStock: integer('in_stock', { mode: 'boolean' }).default(true),
  stock: integer('stock'), // Quantidade em estoque
  stockMinAlert: integer('stock_min_alert').default(0),
  tags: text('tags', { mode: 'json' }).$type<string[] | null>(),
  sku: text('sku').unique(),
  status: text('status').default('active'), // 'active' | 'inactive' | 'draft'
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  author: text('author').notNull(),
  rating: integer('rating').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  verified: integer('verified', { mode: 'boolean' }).default(false),
  helpful: integer('helpful').default(0),
  images: text('images', { mode: 'json' }).$type<string[] | null>(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const cartItems = sqliteTable('cart_items', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Session ID or user ID
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  addedAt: text('added_at').default(sql`CURRENT_TIMESTAMP`),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // Nullable for guest checkout
  customerId: text('customer_id'),
  stripeSessionId: text('stripe_session_id'), // Nullable - may not exist for manual orders
  email: text('email').notNull(),
  customerName: text('customer_name'), // Nome do cliente
  total: real('total').notNull(),
  subtotal: real('subtotal').notNull(),
  subtotalCents: integer('subtotal_cents'),
  tax: real('tax').notNull(),
  shipping: real('shipping').notNull(),
  shippingCents: integer('shipping_cents').default(0),
  discountCents: integer('discount_cents').default(0),
  totalCents: integer('total_cents'),
  status: text('status').default('pending'), // 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  couponCode: text('coupon_code'),
  shippingAddress: text('shipping_address', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  billingAddress: text('billing_address', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password'),
  avatar: text('avatar'),
  role: text('role').default('customer'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  image: text('image'),
  description: text('description'),
  parentId: text('parent_id'),
  displayOrder: integer('display_order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Order Items (produtos em um pedido)
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  productId: text('product_id').notNull(),
  productName: text('product_name').notNull(),
  productPrice: real('product_price').notNull(),
  priceCents: integer('price_cents'),
  quantity: integer('quantity').notNull(),
  subtotal: real('subtotal').notNull(),
  subtotalCents: integer('subtotal_cents'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Coupons
export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // 'percentage' | 'fixed' | 'free_shipping'
  value: real('value').notNull(), // percentage (0-100) or fixed amount in currency
  valueCents: integer('value_cents'), // For fixed discounts in cents (precise)
  minPurchase: real('min_purchase'),
  minPurchaseCents: integer('min_purchase_cents'),
  maxDiscount: real('max_discount'),
  maxDiscountCents: integer('max_discount_cents'),
  usageLimit: integer('usage_limit'), // Legacy: max uses per coupon
  maxUses: integer('max_uses'), // Max total uses
  uses: integer('uses').default(0), // Current usage count
  startsAt: text('starts_at'), // Start date
  endsAt: text('ends_at'), // End date (expires_at)
  active: integer('active', { mode: 'boolean' }).default(true),
  applicableCategories: text('applicable_categories', { mode: 'json' }).$type<string[] | null>(),
  categoryScope: text('category_scope', { mode: 'json' }).$type<string[] | null>(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Admin Users (separado de users para melhor controle)
export const adminUsers = sqliteTable('admin_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(), // bcrypt hash
  role: text('role').notNull().default('viewer'), // 'admin' | 'manager' | 'editor' | 'viewer'
  permissions: text('permissions', { mode: 'json' }).$type<string[] | null>(),
  active: integer('active', { mode: 'boolean' }).default(true),
  lastLoginAt: text('last_login_at'),
  lastActivityAt: text('last_activity_at'),
  sessionExpiresAt: text('session_expires_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Refresh Tokens
export const refreshTokens = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  adminUserId: text('admin_user_id').notNull(),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Audit Logs
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  adminUserId: text('admin_user_id'),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'login', 'logout'
  resource: text('resource').notNull(), // 'product', 'order', 'customer', etc
  resourceId: text('resource_id'),
  details: text('details', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Store Settings
export const storeSettings = sqliteTable('store_settings', {
  id: text('id').primaryKey().default('main'),
  storeName: text('store_name'),
  storeEmail: text('store_email'),
  storePhone: text('store_phone'),
  storeAddress: text('store_address', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  logo: text('logo'),
  favicon: text('favicon'),
  currency: text('currency').default('EUR'),
  taxRate: real('tax_rate').default(0.23), // 23% IVA
  timezone: text('timezone').default('Europe/Lisbon'),
  domain: text('domain'),
  themeColors: text('theme_colors', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  shippingZones: text('shipping_zones', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  contentPages: text('content_pages', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  stripePublishableKey: text('stripe_publishable_key'),
  stripeSecretKey: text('stripe_secret_key'), // encrypted
  stripeWebhookSecret: text('stripe_webhook_secret'), // encrypted
  smtpHost: text('smtp_host'),
  smtpPort: integer('smtp_port'),
  smtpUser: text('smtp_user'),
  smtpPassword: text('smtp_password'), // encrypted
  smtpFrom: text('smtp_from'),
  facebookPixel: text('facebook_pixel'),
  googleAnalytics: text('google_analytics'),
  googleTagManager: text('google_tag_manager'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Product Variants (tamanhos, cores, etc)
export const productVariants = sqliteTable('product_variants', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  name: text('name').notNull(), // 'Tamanho', 'Cor', etc
  value: text('value').notNull(), // 'P', 'M', 'G', 'Vermelho', etc
  priceModifier: real('price_modifier').default(0), // Adicional ao preço base
  stock: integer('stock'),
  sku: text('sku'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Customer Notes (notas internas sobre clientes)
export const customerNotes = sqliteTable('customer_notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // References customers.id
  adminUserId: text('admin_user_id').notNull(),
  note: text('note').notNull(),
  internal: integer('internal', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Product Categories (many-to-many junction table)
export const productCategories = sqliteTable('product_categories', {
  productId: text('product_id').notNull(),
  categoryId: text('category_id').notNull(),
})

// Product Images (R2 image management)
export const productImages = sqliteTable('product_images', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull(),
  r2Key: text('r2_key').notNull(),
  url: text('url').notNull(),
  width: integer('width'),
  height: integer('height'),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Customers (separate from users)
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  phone: text('phone'),
  address: text('address', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Admin Sessions (for httpOnly cookie sessions)
export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(),
  adminUserId: text('admin_user_id').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastActivityAt: text('last_activity_at').default(sql`CURRENT_TIMESTAMP`),
})

// Order Status History (for timeline)
export const orderStatusHistory = sqliteTable('order_status_history', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  status: text('status').notNull(),
  adminUserId: text('admin_user_id'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

// Cache Keys (for cache busting)
export const cacheKeys = sqliteTable('cache_keys', {
  key: text('key').primaryKey(),
  version: text('version').notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

// Rate Limits
export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').default(1),
  resetAt: text('reset_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  variants: many(productVariants),
}))

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}))
