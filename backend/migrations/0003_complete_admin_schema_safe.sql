-- Complete Admin Panel Schema Migration (Safe Version)
-- This version handles the case where some columns may already exist
-- SQLite/D1 doesn't support IF NOT EXISTS in ALTER TABLE ADD COLUMN
-- This migration will attempt to add columns, but some may fail if they already exist
-- That's OK - the migration system will continue with other statements

-- ============================================
-- PRODUCTS TABLE - Add new columns
-- ============================================
-- Products table exists from 0001_init.sql
-- New columns: slug, sku, seo_title, seo_description, stock_min_alert, status

ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN sku TEXT;
ALTER TABLE products ADD COLUMN seo_title TEXT;
ALTER TABLE products ADD COLUMN seo_description TEXT;
ALTER TABLE products ADD COLUMN stock_min_alert INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';

-- ============================================
-- CATEGORIES TABLE - Add new columns
-- ============================================
-- Categories table exists from 0001_init.sql
-- New columns: parent_id, display_order

ALTER TABLE categories ADD COLUMN parent_id TEXT;
ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;

-- ============================================
-- PRODUCT_CATEGORIES - Junction table
-- ============================================
CREATE TABLE IF NOT EXISTS product_categories (
  product_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- ============================================
-- PRODUCT_IMAGES - R2 image management
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

-- ============================================
-- ORDERS TABLE - Add new columns
-- ============================================
-- Orders table exists from 0001_init.sql
-- Already has: user_id, stripe_session_id, email, total, subtotal, tax, shipping, status
-- New columns: customer_id, coupon_code, discount_cents, subtotal_cents, shipping_cents, total_cents

ALTER TABLE orders ADD COLUMN customer_id TEXT;
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN discount_cents INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN subtotal_cents INTEGER;
ALTER TABLE orders ADD COLUMN shipping_cents INTEGER;
ALTER TABLE orders ADD COLUMN total_cents INTEGER;

-- ============================================
-- ORDER_ITEMS TABLE - Add new columns
-- ============================================
-- Order_items table exists from 0002_admin_panel.sql
-- New columns: price_cents, subtotal_cents

ALTER TABLE order_items ADD COLUMN price_cents INTEGER;
ALTER TABLE order_items ADD COLUMN subtotal_cents INTEGER;

-- ============================================
-- CUSTOMERS TABLE - New table
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================
-- COUPONS TABLE - Add new columns
-- ============================================
-- Coupons table exists from 0002_admin_panel.sql
-- Already has: id, code, type, value, min_purchase, max_discount, usage_limit, used_count, expires_at, active, applicable_categories
-- New columns: value_cents, starts_at, ends_at, max_uses, uses, min_purchase_cents, category_scope

ALTER TABLE coupons ADD COLUMN value_cents INTEGER;
ALTER TABLE coupons ADD COLUMN starts_at DATETIME;
ALTER TABLE coupons ADD COLUMN ends_at DATETIME;
ALTER TABLE coupons ADD COLUMN max_uses INTEGER;
ALTER TABLE coupons ADD COLUMN uses INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN min_purchase_cents INTEGER;
ALTER TABLE coupons ADD COLUMN category_scope TEXT;

-- ============================================
-- ADMIN_USERS TABLE - Add new columns
-- ============================================
-- Admin_users table exists from 0002_admin_panel.sql
-- Already has: id, email, name, password, role, permissions, active, last_login_at
-- New columns: last_activity_at, session_expires_at

ALTER TABLE admin_users ADD COLUMN last_activity_at DATETIME;
ALTER TABLE admin_users ADD COLUMN session_expires_at DATETIME;

-- ============================================
-- ADMIN_SESSIONS TABLE - New table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================
-- ORDER_STATUS_HISTORY TABLE - New table
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  admin_user_id TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);

-- ============================================
-- CACHE_KEYS TABLE - New table
-- ============================================
CREATE TABLE IF NOT EXISTS cache_keys (
  key TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STORE_SETTINGS TABLE - Add new columns
-- ============================================
-- Store_settings table exists from 0002_admin_panel.sql
-- New columns: theme_colors, timezone, domain, shipping_zones, content_pages

ALTER TABLE store_settings ADD COLUMN theme_colors TEXT;
ALTER TABLE store_settings ADD COLUMN timezone TEXT DEFAULT 'Europe/Lisbon';
ALTER TABLE store_settings ADD COLUMN domain TEXT;
ALTER TABLE store_settings ADD COLUMN shipping_zones TEXT;
ALTER TABLE store_settings ADD COLUMN content_pages TEXT;

-- ============================================
-- RATE_LIMITS TABLE - New table
-- ============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  reset_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);

