require('dotenv').config();
const pool = require('./utils/database');

async function createClinicServicesTable() {
  try {
    console.log('Creating clinic_services table...');
    
    // Create the clinic_services table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS clinic_services (
        id SERIAL PRIMARY KEY,
        clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(clinic_id, service_id)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('clinic_services table created successfully');
    
    // Populate the table with existing services for all clinics
    console.log('Populating clinic_services with existing data...');
    
    const clinics = await pool.query('SELECT id FROM clinics');
    const services = await pool.query('SELECT id, name FROM services');
    
    // Service names to assign to each clinic
    const serviceNames = [
      'General Practice', 'Pediatrics', 'Cardiology', 'Dental Cleaning', 
      'Tooth Extraction', 'Orthodontics', 'Emergency Care', 'Diagnostics',
      'Orthopedics', 'Ophthalmology', 'Surgery', 'Vaccination',
      'Preventive Care', 'Medical Consultation', 'ECG Test', 'Blood Tests',
      'Physical Examination', 'Community Health Services', 'Maternal Health',
      'Child Health', 'Health Screening', 'Inpatient Care', 'Laboratory',
      'Dental Check-up', 'Dental Surgery', 'Cosmetic Dentistry',
      'Health Education', 'Emergency Medicine', 'General Consultation',
      'Minor Surgery', 'X-Ray Services', 'Gynecology', 'Dermatology'
    ];
    
    for (const clinic of clinics.rows) {
      // Assign a subset of services to each clinic
      const clinicServices = serviceNames.slice(0, 8 + Math.floor(Math.random() * 4));
      
      for (const serviceName of clinicServices) {
        const service = services.rows.find(s => s.name === serviceName);
        if (service) {
          try {
            await pool.query(`
              INSERT INTO clinic_services (clinic_id, service_id, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW())
              ON CONFLICT (clinic_id, service_id) DO NOTHING
            `, [clinic.id, service.id]);
          } catch (err) {
            // Ignore duplicates
          }
        }
      }
    }
    
    console.log('clinic_services table populated successfully');
    
    // Verify the data
    const count = await pool.query('SELECT COUNT(*) as count FROM clinic_services');
    console.log(`Total clinic-service relationships: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('Error creating clinic_services table:', error);
  } finally {
    await pool.end();
  }
}

createClinicServicesTable();
