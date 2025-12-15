-- Final fix for admin@clinicbook.com login
-- Using correct bcrypt hash for 'admin123'

-- First add clinic_manager role and managed_clinic_id column if needed
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('user', 'admin', 'clinic_manager'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_clinic_id INTEGER;

-- Delete any existing admin@clinicbook.com account
DELETE FROM users WHERE email = 'admin@clinicbook.com';

-- Insert the correct admin account
INSERT INTO users (email, password, first_name, last_name, role, managed_clinic_id)
VALUES (
  'admin@clinicbook.com',
  '$2b$10$4bXJDXyAy4q4TrNFVFmMf.EIWDYtEVcH4yY1v1EDFh9/.O1ko3IFS', -- bcrypt('admin123')
  'Clinic', 
  'Manager',
  'clinic_manager',
  1
);

-- Verify the account was created
SELECT id, email, first_name, last_name, role, managed_clinic_id, created_at, updated_at
FROM users
WHERE email = 'admin@clinicbook.com';
