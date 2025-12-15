require('dotenv').config();
const pool = require('./utils/database');

async function addDoctorsToDavaoMedicalClinic() {
  try {
    console.log('Adding doctors to Davao Oriental Medical Clinic...');

    // Get Davao Oriental Medical Clinic ID
    const clinicResult = await pool.query('SELECT id FROM clinics WHERE name = $1', ['Davao Oriental Medical Clinic']);
    const clinicId = clinicResult.rows[0]?.id;
    
    if (!clinicId) {
      console.error('Davao Oriental Medical Clinic not found');
      return;
    }
    
    console.log(`Davao Oriental Medical Clinic ID: ${clinicId}`);

    // Doctors to add for Davao Oriental Medical Clinic
    const doctors = [
      { 
        firstName: 'Roberto', 
        lastName: 'Santos', 
        specialization: 'General Practice', 
        email: 'roberto.santos@davaomedical.com', 
        phone: '(087) 811-2345' 
      },
      { 
        firstName: 'Maria', 
        lastName: 'Reyes', 
        specialization: 'Cardiology', 
        email: 'maria.reyes@davaomedical.com', 
        phone: '(087) 811-2346' 
      },
      { 
        firstName: 'Antonio', 
        lastName: 'Cruz', 
        specialization: 'Pediatrics', 
        email: 'antonio.cruz@davaomedical.com', 
        phone: '(087) 811-2347' 
      }
    ];

    console.log(`\nAdding ${doctors.length} doctors to Davao Oriental Medical Clinic:`);

    // Add each doctor
    for (const doctor of doctors) {
      try {
        // Create user first
        const userResult = await pool.query(`
          INSERT INTO users (first_name, last_name, email, phone, password, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, 'doctor', NOW(), NOW())
          RETURNING id
        `, [doctor.firstName, doctor.lastName, doctor.email, doctor.phone, '$2b$10$default.password.hash.for.doctors']);
        
        const userId = userResult.rows[0].id;
        
        // Then create doctor record
        const doctorResult = await pool.query(`
          INSERT INTO doctors (user_id, clinic_id, specialization, license_number, years_experience, consultation_fee, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
          RETURNING id
        `, [userId, clinicId, doctor.specialization, 'LICENSE-' + Date.now(), 5, 800]);
        
        console.log(`  + Added: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`);
        console.log(`    User ID: ${userId}, Doctor ID: ${doctorResult.rows[0].id}`);
        
      } catch (err) {
        if (err.code === '23505') {
          console.log(`  - Doctor already exists: Dr. ${doctor.firstName} ${doctor.lastName} - skipping`);
        } else {
          console.error(`  - Error adding doctor ${doctor.firstName} ${doctor.lastName}:`, err.message);
        }
      }
    }

    // Verify the doctors were added
    console.log('\n--- Verification ---');
    
    const doctorsResult = await pool.query(`
      SELECT u.first_name, u.last_name, d.specialization
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.clinic_id = $1 AND d.status = 'active'
      ORDER BY u.last_name, u.first_name
    `, [clinicId]);
    
    console.log(`\nDavao Oriental Medical Clinic now has ${doctorsResult.rows.length} doctors:`);
    doctorsResult.rows.forEach(doctor => {
      console.log(`  - Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialization})`);
    });

    console.log('\nSuccessfully added doctors to Davao Oriental Medical Clinic!');
    
  } catch (error) {
    console.error('Error adding doctors to Davao Oriental Medical Clinic:', error);
  } finally {
    await pool.end();
  }
}

addDoctorsToDavaoMedicalClinic();
