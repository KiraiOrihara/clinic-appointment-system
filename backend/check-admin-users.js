require('dotenv').config();
const pool = require('./utils/database');

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users in database...');
    
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, is_admin, created_at 
      FROM users 
      WHERE is_admin = true OR role = 'admin'
      ORDER BY created_at
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin users found in database');
      
      // Check all users to see available accounts
      const allUsers = await pool.query(`
        SELECT id, email, first_name, last_name, is_admin, role 
        FROM users 
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      console.log('📋 Recent users in database:');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (Admin: ${user.is_admin}, Role: ${user.role || 'null'})`);
      });
      
    } else {
      console.log(`✅ Found ${result.rows.length} admin user(s):`);
      result.rows.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}, Role: ${user.role || 'user'}, Admin: ${user.is_admin})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAdminUsers();
