-- Fix Schema Inconsistencies
-- This migration fixes issues found during audit
-- Note: SQLite/D1 doesn't support IF NOT EXISTS in ALTER TABLE ADD COLUMN
-- Most fixes are already applied by migration 0003, so this migration focuses on:
-- 1. Adding missing indexes
-- 2. Verifying table structures
-- 3. Adding any missing columns that weren't added in 0003

-- ============================================
-- INDEXES - Ensure all required indexes exist
-- ============================================

-- Product categories indexes (should already exist from 0003)
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Product images indexes (should already exist from 0003)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(product_id, sort_order);

-- Order status history indexes (should already exist from 0003)
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Admin sessions indexes (should already exist from 0003)
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Refresh tokens indexes (should already exist from 0002)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin_user_id ON refresh_tokens(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Audit logs indexes (should already exist from 0002)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

-- Product variants indexes (should already exist from 0002)
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Customer notes indexes (should already exist from 0002)
CREATE INDEX IF NOT EXISTS idx_customer_notes_user_id ON customer_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_admin_user_id ON customer_notes(admin_user_id);

-- Rate limits indexes (should already exist from 0003)
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Cache keys indexes
CREATE INDEX IF NOT EXISTS idx_cache_keys_updated_at ON cache_keys(updated_at);

-- ============================================
-- VERIFICATION AND CLEANUP
-- ============================================

-- Note: Most schema fixes were already applied in migration 0003
-- This migration focuses on ensuring indexes exist and verifying structure
-- No ALTER TABLE statements needed here as columns were already added in 0003

-- ============================================
-- ADDITIONAL VERIFICATIONS (Optional)
-- ============================================

-- Verify that required tables exist (these should already exist)
-- If any are missing, they would have been created in previous migrations
-- No action needed here - just documentation

-- Expected tables (from migrations 0001-0003):
-- - products (with slug, sku, seo_title, seo_description, stock_min_alert, status)
-- - categories (with parent_id, display_order)
-- - orders (with customer_id, coupon_code, discount_cents, subtotal_cents, shipping_cents, total_cents)
-- - order_items (with price_cents, subtotal_cents)
-- - coupons (with value_cents, starts_at, ends_at, max_uses, uses, min_purchase_cents, category_scope)
-- - admin_users (with last_activity_at, session_expires_at)
-- - product_categories, product_images, customers, admin_sessions, order_status_history, cache_keys, rate_limits

-- Migration complete - all indexes created/verified
