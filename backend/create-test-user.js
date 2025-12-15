require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Create test user with known credentials
async function createTestUser() {
  console.log('👤 Creating test user with known credentials...');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const testUser = {
      email: 'testuser@clinicbook.com',
      password: 'test123456',
      firstName: 'Test',
      lastName: 'User',
      phone: '555-123-4567',
      role: 'user'
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [testUser.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('👤 Test user already exists, updating password...');
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hashedPassword, testUser.email]
      );
    } else {
      console.log('👤 Creating new test user...');
      
      await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, phone, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [testUser.email, hashedPassword, testUser.firstName, testUser.lastName, testUser.phone, testUser.role]
      );
    }

    console.log('✅ Test user created/updated successfully!');
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Password:', testUser.password);
    console.log('👤 Role:', testUser.role);

    // Verify user was created
    const verifyUser = await pool.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [testUser.email]
    );

    console.log('🔍 Verification:', verifyUser.rows[0]);

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await pool.end();
  }
}

// Create the user
createTestUser();
