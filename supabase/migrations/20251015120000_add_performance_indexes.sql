-- Migration: Add Performance Indexes
-- Created: 2025-10-15
-- Description: Add indexes to improve query performance across the platform

-- Items table indexes
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_uploader_id ON items(uploader_id);
CREATE INDEX IF NOT EXISTS idx_items_course ON items(course);
CREATE INDEX IF NOT EXISTS idx_items_year ON items(year);
CREATE INDEX IF NOT EXISTS idx_items_status_created ON items(status, created_at DESC);

-- Purchases table indexes
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_created ON purchases(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Payout requests table indexes
CREATE INDEX IF NOT EXISTS idx_payout_requests_uploader_id ON payout_requests(uploader_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status_created ON payout_requests(status, created_at DESC);

-- Audit logs table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_items_approved_recent ON items(status, created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_item ON purchases(buyer_id, item_id);

-- Full-text search indexes for items (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_items_title_search ON items USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_items_description_search ON items USING gin(to_tsvector('english', description));

-- Add comments for documentation
COMMENT ON INDEX idx_items_status IS 'Improves filtering items by status (pending, approved, rejected)';
COMMENT ON INDEX idx_items_created_at IS 'Improves sorting items by date';
COMMENT ON INDEX idx_purchases_buyer_id IS 'Improves user purchase history queries';
COMMENT ON INDEX idx_items_title_search IS 'Enables full-text search on item titles';
