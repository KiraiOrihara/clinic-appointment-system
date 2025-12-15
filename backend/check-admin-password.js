require('dotenv').config();
const pool = require('./utils/database');
const bcrypt = require('bcryptjs');

async function checkAdminPassword() {
  try {
    console.log('🔍 Checking admin user details...');
    
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, password 
      FROM users 
      WHERE role = 'admin'
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin user found');
      return;
    }
    
    const admin = result.rows[0];
    console.log('👑 Admin user found:');
    console.log(`  - Email: ${admin.email}`);
    console.log(`  - Name: ${admin.first_name} ${admin.last_name}`);
    console.log(`  - Role: ${admin.role}`);
    console.log(`  - Password Hash: ${admin.password.substring(0, 20)}...`);
    
    // Test common passwords
    const testPasswords = ['test123456', 'admin123', 'password', '123456'];
    
    for (const testPass of testPasswords) {
      const isValid = await bcrypt.compare(testPass, admin.password);
      console.log(`  - Password "${testPass}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      
      if (isValid) {
        console.log(`\n✅ Found working admin password: "${testPass}"`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAdminPassword();
