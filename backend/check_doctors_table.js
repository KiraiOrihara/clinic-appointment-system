require('dotenv').config();
const pool = require('./utils/database');

async function checkDoctorsTable() {
  try {
    console.log('Checking doctors table structure...');
    
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position
    `);
    
    console.log('Doctors table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check some sample data
    const sampleResult = await pool.query('SELECT * FROM doctors LIMIT 3');
    console.log('\nSample doctors data:');
    sampleResult.rows.forEach((doctor, index) => {
      console.log(`Doctor ${index + 1}:`, doctor);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkDoctorsTable();
