require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Simple Database Test');
console.log('========================');

// Show database configuration
console.log('Database Config:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  Name: ${process.env.DB_NAME}`);
console.log(`  User: ${process.env.DB_USER}`);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function testDatabase() {
  try {
    console.log('\n🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    // Test 1: List all tables
    console.log('\n📋 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test 2: Check if appointments table exists and count records
    console.log('\n📊 Checking appointments table...');
    try {
      const countResult = await client.query('SELECT COUNT(*) as count FROM appointments');
      console.log(`Total appointments: ${countResult.rows[0].count}`);
      
      if (parseInt(countResult.rows[0].count) > 0) {
        console.log('\n📋 Recent appointments:');
        const recentResult = await client.query(`
          SELECT 
            id, first_name, last_name, email, service, 
            appointment_date, appointment_time, status, created_at
          FROM appointments 
          ORDER BY created_at DESC 
          LIMIT 5
        `);
        
        recentResult.rows.forEach((apt, index) => {
          console.log(`\n${index + 1}. ID: ${apt.id}`);
          console.log(`   Name: ${apt.first_name} ${apt.last_name}`);
          console.log(`   Email: ${apt.email}`);
          console.log(`   Service: ${apt.service}`);
          console.log(`   Date: ${apt.appointment_date} at ${apt.appointment_time}`);
          console.log(`   Status: ${apt.status}`);
          console.log(`   Created: ${apt.created_at}`);
        });
      }
    } catch (error) {
      console.log('❌ Error accessing appointments table:', error.message);
    }
    
    // Test 3: Check clinics table
    console.log('\n🏥 Checking clinics table...');
    try {
      const clinicCount = await client.query('SELECT COUNT(*) as count FROM clinics');
      console.log(`Total clinics: ${clinicCount.rows[0].count}`);
      
      const clinicResult = await client.query('SELECT id, name, address FROM clinics LIMIT 3');
      console.log('Sample clinics:');
      clinicResult.rows.forEach(clinic => {
        console.log(`  ${clinic.id}: ${clinic.name} - ${clinic.address}`);
      });
    } catch (error) {
      console.log('❌ Error accessing clinics table:', error.message);
    }
    
    client.release();
    console.log('\n✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
