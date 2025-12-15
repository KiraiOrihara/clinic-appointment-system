require('dotenv').config();

// Debug login to understand the issue
async function debugLogin() {
  console.log('🔍 Debugging login endpoint...');
  
  try {
    const loginData = {
      email: 'arizarhenzon322@gmail.com',
      password: 'password123'
    };

    console.log('📤 Login attempt with:', { email: loginData.email });
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    console.log('🔐 Login status:', loginResponse.status);
    console.log('🔐 Login headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    const responseText = await loginResponse.text();
    console.log('🔐 Login response body:', responseText);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Also check if we have users in the database
async function checkUsers() {
  console.log('👥 Checking users in database...');
  
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const result = await pool.query('SELECT id, email, role FROM users LIMIT 5');
    console.log('👥 Users found:', result.rows);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

// Run both checks
checkUsers().then(() => debugLogin());
