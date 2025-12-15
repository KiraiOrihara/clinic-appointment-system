require('dotenv').config();
const pool = require('./utils/database');

async function checkAdminRole() {
  try {
    console.log('🔍 Checking for admin role users...');
    
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, role, created_at 
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin users found');
      
      // Check all users and their roles
      const allUsers = await pool.query(`
        SELECT id, email, first_name, last_name, role 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      console.log('📋 All users and their roles:');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (Role: ${user.role})`);
      });
      
      // Make the first user an admin for testing
      if (allUsers.rows.length > 0) {
        const firstUser = allUsers.rows[0];
        console.log(`\n🔧 Making ${firstUser.email} an admin for testing...`);
        
        await pool.query(`
          UPDATE users 
          SET role = 'admin', updated_at = NOW() 
          WHERE id = $1
        `, [firstUser.id]);
        
        console.log(`✅ ${firstUser.email} is now an admin`);
      }
      
    } else {
      console.log(`✅ Found ${result.rows.length} admin user(s):`);
      result.rows.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}, Role: ${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAdminRole();
