require('dotenv').config();
const pool = require('./utils/database');

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    
    // Check users table structure
    const usersSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table structure:');
    usersSchema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Check a sample user record
    const sampleUser = await pool.query('SELECT * FROM users LIMIT 1');
    console.log('\nSample user record:', sampleUser.rows[0]);
    
  } catch (error) {
    console.error('Error checking users table:', error);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
