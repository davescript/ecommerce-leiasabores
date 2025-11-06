import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: real('price').notNull(),
  originalPrice: real('original_price'),
  category: text('category').notNull(),
  images: text('images', { mode: 'json' }).$type<string[] | null>(),
  rating: real('rating').default(0),
  reviewCount: integer('review_count').default(0),
  inStock: integer('in_stock', { mode: 'boolean' }).default(true),
  tags: text('tags', { mode: 'json' }).$type<string[] | null>(),
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
  userId: text('user_id').notNull(),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  addedAt: text('added_at').default(sql`CURRENT_TIMESTAMP`),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  stripeSessionId: text('stripe_session_id').notNull(),
  email: text('email').notNull(),
  total: real('total').notNull(),
  subtotal: real('subtotal').notNull(),
  tax: real('tax').notNull(),
  shipping: real('shipping').notNull(),
  status: text('status').default('pending'),
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
})

export const productsRelations = relations(products, ({ many }) => ({
  reviews: many(reviews),
  cartItems: many(cartItems),
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
