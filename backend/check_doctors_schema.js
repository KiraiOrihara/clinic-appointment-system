const pool = require('./utils/database');

async function checkDoctorsSchema() {
  try {
    const result = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'doctors\' ORDER BY ordinal_position');
    console.log('Doctors table columns:');
    result.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkDoctorsSchema();
