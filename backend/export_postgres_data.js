const { Pool } = require('pg');
const fs = require('fs');

// PostgreSQL connection from original backend
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'clinic_booking',
  user: 'postgres',
  password: 'admin',
});

async function exportData() {
  try {
    console.log('Connecting to PostgreSQL...');
    await pool.connect();
    
    // Export users
    const usersResult = await pool.query('SELECT * FROM users');
    console.log(`Found ${usersResult.rows.length} users`);
    
    // Export clinics
    const clinicsResult = await pool.query('SELECT * FROM clinics');
    console.log(`Found ${clinicsResult.rows.length} clinics`);
    
    // Export appointments
    const appointmentsResult = await pool.query('SELECT * FROM appointments');
    console.log(`Found ${appointmentsResult.rows.length} appointments`);
    
    // Save data to JSON files
    fs.writeFileSync('users.json', JSON.stringify(usersResult.rows, null, 2));
    fs.writeFileSync('clinics.json', JSON.stringify(clinicsResult.rows, null, 2));
    fs.writeFileSync('appointments.json', JSON.stringify(appointmentsResult.rows, null, 2));
    
    console.log('Data exported successfully!');
    console.log('Files created: users.json, clinics.json, appointments.json');
    
    // Show sample data
    if (usersResult.rows.length > 0) {
      console.log('\nSample user:', usersResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await pool.end();
  }
}

exportData();
