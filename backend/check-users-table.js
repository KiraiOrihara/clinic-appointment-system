require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table structure...');
    
    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    
    const structureResult = await pool.query(structureQuery);
    console.log('Users table columns:');
    structureResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Get all users with simple query
    console.log('\n📋 Getting all users...');
    const usersQuery = 'SELECT * FROM users ORDER BY created_at DESC';
    const usersResult = await pool.query(usersQuery);
    
    console.log(`Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    if (usersResult.rows.length === 0) {
      console.log('⚠️ No users found in the database');
    }
    
  } catch (error) {
    console.error('❌ Error checking users table:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
