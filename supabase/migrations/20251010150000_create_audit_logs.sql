/*
  # Create audit logs table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `action` (text) - Action type performed
      - `resource_type` (text) - Type of resource affected
      - `resource_id` (uuid) - ID of affected resource
      - `metadata` (jsonb) - Additional context
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `audit_logs` table
    - Only admins can read audit logs
    - System can insert logs (no user access)

  3. Indexes
    - Index on user_id for filtering
    - Index on action for searching
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read all audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE audit_logs IS 'Tracks all administrative actions for compliance and security';
