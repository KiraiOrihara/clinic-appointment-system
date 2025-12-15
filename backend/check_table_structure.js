require('dotenv').config();
const pool = require('./utils/database');

async function checkTableStructure() {
  try {
    console.log('Checking table structures...');
    
    // Check doctors table structure
    const doctorsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'doctors' 
      ORDER BY ordinal_position
    `);
    
    console.log('Doctors table structure:');
    doctorsSchema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Check services table structure
    const servicesSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nServices table structure:');
    servicesSchema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
    // Check a sample doctor record
    const sampleDoctor = await pool.query('SELECT * FROM doctors LIMIT 1');
    console.log('\nSample doctor record:', sampleDoctor.rows[0]);
    
    // Check a sample service record
    const sampleService = await pool.query('SELECT * FROM services LIMIT 1');
    console.log('\nSample service record:', sampleService.rows[0]);
    
  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
