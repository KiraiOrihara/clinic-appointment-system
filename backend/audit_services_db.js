require('dotenv').config();
const pool = require('./utils/database');

async function auditServicesDatabase() {
  try {
    console.log('=== AUDITING CLINIC SERVICES DATABASE STRUCTURE ===\n');
    
    // 1. Check all tables that might contain services data
    console.log('1. Checking tables related to services...');
    const tablesQuery = `
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('services', 'clinics', 'clinic_services')
      ORDER BY table_name, ordinal_position
    `;
    const tablesResult = await pool.query(tablesQuery);
    
    console.log('Tables and columns:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}.${row.column_name} (${row.data_type})`);
    });
    
    // 2. Check if clinic_services table exists and its structure
    console.log('\n2. Checking clinic_services junction table...');
    const clinicServicesCheck = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'clinic_services'
      ) as exists;
    `;
    const existsResult = await pool.query(clinicServicesCheck);
    console.log(`clinic_services table exists: ${existsResult.rows[0].exists}`);
    
    if (existsResult.rows[0].exists) {
      const clinicServicesData = `
        SELECT COUNT(*) as total_records,
               COUNT(DISTINCT clinic_id) as unique_clinics,
               COUNT(DISTINCT service_id) as unique_services
        FROM clinic_services
      `;
      const dataResult = await pool.query(clinicServicesData);
      console.log(`Total clinic-service relationships: ${dataResult.rows[0].total_records}`);
      console.log(`Clinics with services: ${dataResult.rows[0].unique_clinics}`);
      console.log(`Services linked to clinics: ${dataResult.rows[0].unique_services}`);
      
      // Sample data
      const sampleQuery = `
        SELECT cs.clinic_id, cs.service_id, s.name as service_name, c.name as clinic_name
        FROM clinic_services cs
        LEFT JOIN services s ON cs.service_id = s.id
        LEFT JOIN clinics c ON cs.clinic_id = c.id
        LIMIT 5
      `;
      const sampleResult = await pool.query(sampleQuery);
      console.log('\nSample clinic-service relationships:');
      sampleResult.rows.forEach(row => {
        console.log(`- Clinic ${row.clinic_id} (${row.clinic_name}) -> Service ${row.service_id} (${row.service_name})`);
      });
    }
    
    // 3. Check services table structure and data
    console.log('\n3. Checking services table...');
    const servicesCount = await pool.query('SELECT COUNT(*) as count FROM services');
    console.log(`Total services in database: ${servicesCount.rows[0].count}`);
    
    const servicesSample = await pool.query('SELECT id, name, description FROM services LIMIT 3');
    console.log('Sample services:');
    servicesSample.rows.forEach(service => {
      console.log(`- ${service.id}: ${service.name}`);
    });
    
    // 4. Check clinics with services
    console.log('\n4. Checking clinics and their services...');
    const clinicsWithServices = `
      SELECT c.id, c.name, COUNT(cs.service_id) as service_count
      FROM clinics c
      LEFT JOIN clinic_services cs ON c.id = cs.clinic_id
      GROUP BY c.id, c.name
      ORDER BY service_count DESC
      LIMIT 5
    `;
    const clinicsResult = await pool.query(clinicsWithServices);
    console.log('Clinics and their service counts:');
    clinicsResult.rows.forEach(clinic => {
      console.log(`- ${clinic.id}: ${clinic.name} (${clinic.service_count} services)`);
    });
    
  } catch (error) {
    console.error('Error auditing services database:', error);
  } finally {
    await pool.end();
  }
}

auditServicesDatabase();
