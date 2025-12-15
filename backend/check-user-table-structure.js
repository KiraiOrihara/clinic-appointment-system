require('dotenv').config();
const pool = require('./utils/database');

async function checkUserTableStructure() {
  try {
    console.log('🔍 Checking user table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Users table columns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable}) ${col.column_default ? `[Default: ${col.column_default}]` : ''}`);
    });
    
    // Check all users
    const users = await pool.query(`
      SELECT id, email, first_name, last_name, created_at 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    console.log('\n👥 Recent users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.first_name} ${user.last_name}) - ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUserTableStructure();
