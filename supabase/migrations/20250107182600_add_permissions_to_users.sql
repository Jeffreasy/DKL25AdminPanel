-- Add permissions column to users table for RBAC system
ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance on permissions queries
CREATE INDEX idx_users_permissions ON users USING GIN (permissions);

-- Update existing users with default permissions based on their role
-- This ensures backward compatibility
UPDATE users SET permissions = CASE
  WHEN rol = 'admin' THEN '[
    {"resource": "contact", "action": "read"},
    {"resource": "contact", "action": "write"},
    {"resource": "contact", "action": "delete"},
    {"resource": "aanmelding", "action": "read"},
    {"resource": "aanmelding", "action": "write"},
    {"resource": "aanmelding", "action": "delete"},
    {"resource": "newsletter", "action": "read"},
    {"resource": "newsletter", "action": "write"},
    {"resource": "newsletter", "action": "send"},
    {"resource": "newsletter", "action": "delete"},
    {"resource": "email", "action": "read"},
    {"resource": "email", "action": "write"},
    {"resource": "email", "action": "delete"},
    {"resource": "email", "action": "fetch"},
    {"resource": "user", "action": "read"},
    {"resource": "user", "action": "write"},
    {"resource": "user", "action": "delete"},
    {"resource": "user", "action": "manage_roles"},
    {"resource": "chat", "action": "read"},
    {"resource": "chat", "action": "write"},
    {"resource": "chat", "action": "manage_channel"},
    {"resource": "chat", "action": "moderate"},
    {"resource": "admin_email", "action": "send"}
  ]'::jsonb
  WHEN rol = 'staff' THEN '[
    {"resource": "contact", "action": "read"},
    {"resource": "contact", "action": "write"},
    {"resource": "aanmelding", "action": "read"},
    {"resource": "aanmelding", "action": "write"},
    {"resource": "newsletter", "action": "read"},
    {"resource": "newsletter", "action": "write"},
    {"resource": "newsletter", "action": "send"},
    {"resource": "email", "action": "read"},
    {"resource": "email", "action": "write"},
    {"resource": "email", "action": "fetch"},
    {"resource": "chat", "action": "read"},
    {"resource": "chat", "action": "write"},
    {"resource": "chat", "action": "moderate"},
    {"resource": "admin_email", "action": "send"}
  ]'::jsonb
  WHEN rol = 'user' THEN '[
    {"resource": "chat", "action": "read"},
    {"resource": "chat", "action": "write"}
  ]'::jsonb
  ELSE '[]'::jsonb
END;

-- Add comment to document the permissions structure
COMMENT ON COLUMN users.permissions IS 'JSONB array of permission objects with resource and action fields for RBAC system';