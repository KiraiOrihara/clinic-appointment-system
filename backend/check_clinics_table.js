require('dotenv').config();
const pool = require('./utils/database');

async function checkClinicsTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clinics' ORDER BY ordinal_position`
    );
    console.log('📋 Clinics table structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    client.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkClinicsTable();
