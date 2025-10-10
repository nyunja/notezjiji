/*
  # Academic Notes Marketplace - Core Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null)
      - `role` (text, not null, default 'buyer')
      - `full_name` (text, not null)
      - `phone` (text, nullable)
      - `bank_name` (text, nullable)
      - `account_number` (text, nullable)
      - `account_name` (text, nullable)
      - `is_verified` (boolean, default false)
      - `is_suspended` (boolean, default false)
      - `failed_login_attempts` (integer, default 0)
      - `last_login_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `items`
      - `id` (uuid, primary key)
      - `uploader_id` (uuid, foreign key to users)
      - `title` (text, not null)
      - `description` (text, not null)
      - `course` (text, not null)
      - `year` (text, not null)
      - `tags` (text[], not null)
      - `price` (decimal, not null)
      - `status` (text, default 'pending')
      - `approval_status` (text, default 'pending')
      - `file_path` (text, not null)
      - `preview_path` (text, nullable)
      - `thumbnail_path` (text, nullable)
      - `page_count` (integer, nullable)
      - `file_size` (bigint, not null)
      - `view_count` (integer, default 0)
      - `purchase_count` (integer, default 0)
      - `rejection_reason` (text, nullable)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `deleted_at` (timestamptz, nullable)

    - `purchases`
      - `id` (uuid, primary key)
      - `buyer_id` (uuid, foreign key to users)
      - `item_id` (uuid, foreign key to items)
      - `amount` (decimal, not null)
      - `payment_status` (text, default 'pending')
      - `paystack_reference` (text, unique, not null)
      - `paystack_access_code` (text, nullable)
      - `transaction_date` (timestamptz, nullable)
      - `download_count` (integer, default 0)
      - `max_downloads` (integer, default 5)
      - `metadata` (jsonb, default '{}')
      - `created_at` (timestamptz, default now())

    - `payouts`
      - `id` (uuid, primary key)
      - `uploader_id` (uuid, foreign key to users)
      - `amount` (decimal, not null)
      - `platform_fee` (decimal, not null)
      - `paystack_fee` (decimal, default 0)
      - `net_amount` (decimal, not null)
      - `bank_details` (jsonb, not null)
      - `status` (text, default 'pending')
      - `paystack_transfer_code` (text, nullable)
      - `admin_notes` (text, nullable)
      - `requested_at` (timestamptz, default now())
      - `processed_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())

    - `sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `token_hash` (text, not null)
      - `device_info` (text, nullable)
      - `ip_address` (text, nullable)
      - `expires_at` (timestamptz, not null)
      - `created_at` (timestamptz, default now())

    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users, nullable)
      - `action` (text, not null)
      - `entity_type` (text, not null)
      - `entity_id` (uuid, nullable)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `changes` (jsonb, default '{}')
      - `created_at` (timestamptz, default now())

    - `rate_limit_logs`
      - `id` (uuid, primary key)
      - `identifier` (text, not null)
      - `endpoint` (text, not null)
      - `attempts` (integer, not null)
      - `blocked_at` (timestamptz, default now())
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access based on roles
    - Users can read their own data
    - Uploaders can manage their items
    - Buyers can view approved items and their purchases

  3. Indexes
    - Create indexes on foreign keys and frequently queried columns
    - Add indexes for email, status fields, and timestamps
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'buyer',
  full_name text NOT NULL,
  phone text,
  bank_name text,
  account_number text,
  account_name text,
  is_verified boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  failed_login_attempts integer DEFAULT 0,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  course text NOT NULL,
  year text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  approval_status text DEFAULT 'pending',
  file_path text NOT NULL,
  preview_path text,
  thumbnail_path text,
  page_count integer,
  file_size bigint NOT NULL,
  view_count integer DEFAULT 0,
  purchase_count integer DEFAULT 0,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_status text DEFAULT 'pending',
  paystack_reference text UNIQUE NOT NULL,
  paystack_access_code text,
  transaction_date timestamptz,
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 5,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  platform_fee decimal(10,2) NOT NULL,
  paystack_fee decimal(10,2) DEFAULT 0,
  net_amount decimal(10,2) NOT NULL,
  bank_details jsonb NOT NULL,
  status text DEFAULT 'pending',
  paystack_transfer_code text,
  admin_notes text,
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  device_info text,
  ip_address text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  ip_address text,
  user_agent text,
  changes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  attempts integer NOT NULL,
  blocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_items_uploader_id ON items(uploader_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_approval_status ON items(approval_status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_payouts_uploader_id ON payouts(uploader_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view approved items"
  ON items FOR SELECT
  TO authenticated
  USING (approval_status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Uploaders can view own items"
  ON items FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Uploaders can create items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Uploaders can update own pending items"
  ON items FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid() AND status IN ('pending', 'rejected'))
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid());

CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
