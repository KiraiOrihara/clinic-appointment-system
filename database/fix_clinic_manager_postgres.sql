-- Fix clinic manager account for PostgreSQL
-- First, we need to add the clinic_manager role and managed_clinic_id column

-- Add clinic_manager role to the check constraint
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin', 'clinic_manager'));

-- Add managed_clinic_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_clinic_id INTEGER;

-- Update existing account or insert new clinic manager
INSERT INTO users (email, password, first_name, last_name, role, managed_clinic_id)
VALUES (
  'admin@clinicbook.com',
  '$2a$10$rQZ8ZvGQJvKJ8ZvZvZvZvOZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZv', -- bcrypt('admin123')
  'Clinic', 
  'Manager',
  'clinic_manager',
  1
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  managed_clinic_id = EXCLUDED.managed_clinic_id,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the account was created/updated
SELECT id, email, first_name, last_name, role, managed_clinic_id, created_at, updated_at
FROM users
WHERE email = 'admin@clinicbook.com';
