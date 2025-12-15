require('dotenv').config();
const pool = require('./utils/database');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  try {
    console.log('🔧 Setting admin password...');
    
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(`
      UPDATE users 
      SET password = $1, updated_at = NOW() 
      WHERE role = 'admin'
      RETURNING id, email, first_name, last_name
    `, [hashedPassword]);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin password updated successfully:');
      console.log(`  - Email: ${result.rows[0].email}`);
      console.log(`  - New Password: ${newPassword}`);
    } else {
      console.log('❌ No admin user found to update');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

setAdminPassword();
