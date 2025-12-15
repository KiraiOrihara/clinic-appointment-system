require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function removeUser() {
  try {
    console.log('🔍 Searching for user: arizarhenzon322@gmail.com');
    
    // First, check if user exists
    const checkQuery = 'SELECT * FROM users WHERE email = $1';
    const checkResult = await pool.query(checkQuery, ['arizarhenzon322@gmail.com']);
    
    if (checkResult.rows.length === 0) {
      console.log('✅ User arizarhenzon322@gmail.com does not exist');
      return;
    }
    
    console.log('📋 User found:');
    console.log(`  ID: ${checkResult.rows[0].id}`);
    console.log(`  Email: ${checkResult.rows[0].email}`);
    console.log(`  Name: ${checkResult.rows[0].first_name} ${checkResult.rows[0].last_name}`);
    console.log(`  Role: ${checkResult.rows[0].role}`);
    
    // Remove the user
    console.log('\n🗑️ Removing user...');
    const deleteQuery = 'DELETE FROM users WHERE email = $1';
    const deleteResult = await pool.query(deleteQuery, ['arizarhenzon322@gmail.com']);
    
    console.log(`✅ Successfully removed ${deleteResult.rowCount} user(s)`);
    
    // Verify removal
    const verifyResult = await pool.query(checkQuery, ['arizarhenzon322@gmail.com']);
    if (verifyResult.rows.length === 0) {
      console.log('✅ Verification: User no longer exists in database');
    } else {
      console.log('❌ Verification: User still exists');
    }
    
    // Show remaining users
    console.log('\n📋 Remaining users in database:');
    const remainingQuery = 'SELECT id, email, first_name, last_name, role FROM users ORDER BY created_at DESC';
    const remainingResult = await pool.query(remainingQuery);
    
    remainingResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error removing user:', error.message);
  } finally {
    await pool.end();
  }
}

removeUser();
