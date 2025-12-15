-- Insert or update admin account
-- Email: arizarhenzon@gmail.com
-- Password: Rhenzon123! (will be hashed by backend)

INSERT INTO users (email, password, first_name, last_name, role, phone)
VALUES (
  'arizarhenzon@gmail.com',
  '$2b$10$placeholder_hash_will_be_updated_by_backend',
  'Ariz',
  'Arhenzon',
  'admin',
  '+63 912 345 6789'
)
ON CONFLICT (email) 
DO UPDATE SET 
  role = 'admin',
  updated_at = CURRENT_TIMESTAMP;

-- Verify admin account exists
SELECT id, email, role, first_name, last_name, created_at 
FROM users 
WHERE email = 'arizarhenzon@gmail.com';
