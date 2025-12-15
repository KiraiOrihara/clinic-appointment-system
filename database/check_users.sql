-- Check existing users and their password hashes
SELECT email, first_name, last_name, role, password 
FROM users 
ORDER BY id;

-- Check if admin@clinicbook.com exists
SELECT * FROM users WHERE email = 'admin@clinicbook.com';
