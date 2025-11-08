-- Complete Admin Panel Schema Migration (Fixed Version)
-- This migration updates the schema to match the complete admin panel requirements
-- Note: SQLite/D1 doesn't support IF NOT EXISTS in ALTER TABLE ADD COLUMN
-- Solution: We'll add columns without IF NOT EXISTS and handle errors gracefully
-- If a column already exists, that migration step will fail but others will continue

-- Update products table to match new schema
-- These statements will fail if columns already exist, but that's OK for new installations
ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN sku TEXT;
ALTER TABLE products ADD COLUMN seo_title TEXT;
ALTER TABLE products ADD COLUMN seo_description TEXT;
ALTER TABLE products ADD COLUMN stock_min_alert INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';

-- Update categories to support parent_id properly
ALTER TABLE categories ADD COLUMN parent_id TEXT;
ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create product_categories junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS product_categories (
  product_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- Create product_images table for R2 image management
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

-- Update orders table
-- Note: status column already exists from 0001_init.sql, skip it
ALTER TABLE orders ADD COLUMN customer_id TEXT;
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN discount_cents INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN subtotal_cents INTEGER;
ALTER TABLE orders ADD COLUMN shipping_cents INTEGER;
ALTER TABLE orders ADD COLUMN total_cents INTEGER;

-- Update order_items to use cents
ALTER TABLE order_items ADD COLUMN price_cents INTEGER;
ALTER TABLE order_items ADD COLUMN subtotal_cents INTEGER;

-- Create customers table (separate from users)
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

-- Update coupons table to match new schema
-- Note: type, value, expires_at, used_count already exist from 0002_admin_panel.sql
-- Only add new columns that don't exist
ALTER TABLE coupons ADD COLUMN value_cents INTEGER;
ALTER TABLE coupons ADD COLUMN starts_at DATETIME;
ALTER TABLE coupons ADD COLUMN ends_at DATETIME;
ALTER TABLE coupons ADD COLUMN max_uses INTEGER;
ALTER TABLE coupons ADD COLUMN uses INTEGER DEFAULT 0;
ALTER TABLE coupons ADD COLUMN min_purchase_cents INTEGER;
ALTER TABLE coupons ADD COLUMN category_scope TEXT;

-- Update admin_users to support RBAC properly
-- Note: role column already exists from 0002_admin_panel.sql
ALTER TABLE admin_users ADD COLUMN permissions TEXT;
ALTER TABLE admin_users ADD COLUMN last_activity_at DATETIME;
ALTER TABLE admin_users ADD COLUMN session_expires_at DATETIME;

-- Create sessions table for httpOnly cookie sessions
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

-- Create order_status_history table for timeline
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

-- Create cache_keys table for cache busting
CREATE TABLE IF NOT EXISTS cache_keys (
  key TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Update store_settings with additional fields
ALTER TABLE store_settings ADD COLUMN theme_colors TEXT;
ALTER TABLE store_settings ADD COLUMN timezone TEXT DEFAULT 'Europe/Lisbon';
ALTER TABLE store_settings ADD COLUMN domain TEXT;
ALTER TABLE store_settings ADD COLUMN shipping_zones TEXT;
ALTER TABLE store_settings ADD COLUMN content_pages TEXT;

-- Create rate_limit table
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  reset_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);

