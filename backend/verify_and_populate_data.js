require('dotenv').config();
const pool = require('./utils/database');

async function verifyAndPopulateData() {
  try {
    console.log('Verifying and populating clinic data...\n');

    // Get all clinics
    const clinicsResult = await pool.query('SELECT id, name FROM clinics ORDER BY id');
    const clinics = clinicsResult.rows;
    console.log(`Found ${clinics.length} clinics`);

    // Get all services
    const servicesResult = await pool.query('SELECT id, name FROM services ORDER BY id');
    const services = servicesResult.rows;
    console.log(`Found ${services.length} services\n`);

    // Define services for each clinic
    const clinicServices = {
      1: ['General Practice', 'Pediatrics', 'Cardiology', 'Emergency Care', 'Diagnostics', 'Orthopedics', 'Ophthalmology', 'Surgery'],
      2: ['General Practice', 'Cardiology', 'Diagnostics', 'Laboratory', 'X-Ray Services', 'Ultrasound', 'ECG Test', 'Blood Tests'],
      3: ['General Practice', 'Pediatrics', 'Cardiology', 'Emergency Care', 'Diagnostics', 'Orthopedics', 'Surgery', 'Vaccination'],
      4: ['Community Health Services', 'Maternal Health', 'Child Health', 'Health Screening', 'Preventive Care', 'Health Education', 'Vaccination', 'General Practice'],
      5: ['General Practice', 'Pediatrics', 'Cardiology', 'Emergency Care', 'Surgery', 'Internal Medicine', 'Orthopedics', 'Diagnostics'],
      6: ['Dental Cleaning', 'Tooth Extraction', 'Orthodontics', 'Dental Check-up', 'Dental Surgery', 'Cosmetic Dentistry'],
      7: ['Dental Cleaning', 'Tooth Extraction', 'Orthodontics', 'Dental Check-up', 'Dental Surgery', 'Cosmetic Dentistry'],
      8: ['Community Health Services', 'Maternal Health', 'Child Health', 'Health Screening', 'Preventive Care', 'General Practice', 'Vaccination', 'Health Education']
    };

    // Populate clinic_services
    console.log('Populating clinic_services...');
    for (const clinic of clinics) {
      const serviceNames = clinicServices[clinic.id] || [];
      
      for (const serviceName of serviceNames) {
        const service = services.find(s => s.name === serviceName);
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
      console.log(`  ✓ ${clinic.name}: ${serviceNames.length} services`);
    }

    // Verify clinic_services
    console.log('\nVerifying clinic_services...');
    for (const clinic of clinics) {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM clinic_services WHERE clinic_id = $1
      `, [clinic.id]);
      const count = result.rows[0].count;
      console.log(`  ${clinic.name}: ${count} services`);
    }

    // Get all users with doctor role
    const doctorsResult = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, d.id as doctor_id, d.clinic_id, d.specialization
      FROM users u
      LEFT JOIN doctors d ON u.id = d.user_id
      WHERE u.role = 'doctor'
      ORDER BY u.id
    `);
    const doctors = doctorsResult.rows;
    console.log(`\nFound ${doctors.length} doctors in users table`);

    // Check doctors in clinics
    console.log('\nVerifying doctors in clinics...');
    for (const clinic of clinics) {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM doctors WHERE clinic_id = $1 AND status = 'active'
      `, [clinic.id]);
      const count = result.rows[0].count;
      console.log(`  ${clinic.name}: ${count} active doctors`);
    }

    // Add doctors to clinics if missing
    console.log('\nAdding doctors to clinics...');
    const doctorsByClinic = {
      1: [
        { firstName: 'Maria', lastName: 'Santos', specialization: 'General Practice' },
        { firstName: 'Juan', lastName: 'Cruz', specialization: 'Pediatrics' },
        { firstName: 'Ana', lastName: 'Lopez', specialization: 'Cardiology' }
      ],
      2: [
        { firstName: 'Carlos', lastName: 'Garcia', specialization: 'General Practice' },
        { firstName: 'Rosa', lastName: 'Martinez', specialization: 'Cardiology' }
      ],
      3: [
        { firstName: 'Roberto', lastName: 'Santos', specialization: 'General Practice' },
        { firstName: 'Maria', lastName: 'Reyes', specialization: 'Cardiology' },
        { firstName: 'Antonio', lastName: 'Cruz', specialization: 'Pediatrics' }
      ],
      4: [
        { firstName: 'Elena', lastName: 'Fernandez', specialization: 'General Practice' },
        { firstName: 'Miguel', lastName: 'Diaz', specialization: 'Pediatrics' }
      ],
      5: [
        { firstName: 'Fernando', lastName: 'Morales', specialization: 'General Practice' },
        { firstName: 'Lucia', lastName: 'Gutierrez', specialization: 'Cardiology' },
        { firstName: 'Diego', lastName: 'Flores', specialization: 'Surgery' }
      ],
      6: [
        { firstName: 'Patricia', lastName: 'Ruiz', specialization: 'Dentistry' },
        { firstName: 'Jorge', lastName: 'Vargas', specialization: 'Dentistry' }
      ],
      7: [
        { firstName: 'Sofia', lastName: 'Mendez', specialization: 'Dentistry' },
        { firstName: 'Ricardo', lastName: 'Soto', specialization: 'Dentistry' }
      ],
      8: [
        { firstName: 'Gabriela', lastName: 'Herrera', specialization: 'General Practice' },
        { firstName: 'Manuel', lastName: 'Castillo', specialization: 'Pediatrics' }
      ]
    };

    for (const clinic of clinics) {
      const doctorsList = doctorsByClinic[clinic.id] || [];
      
      for (const doctor of doctorsList) {
        try {
          // Check if doctor already exists
          const existingDoctor = await pool.query(`
            SELECT d.id FROM doctors d
            JOIN users u ON d.user_id = u.id
            WHERE d.clinic_id = $1 AND u.first_name = $2 AND u.last_name = $3
          `, [clinic.id, doctor.firstName, doctor.lastName]);

          if (existingDoctor.rows.length === 0) {
            // Create user
            const userResult = await pool.query(`
              INSERT INTO users (first_name, last_name, email, phone, password, role, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, 'doctor', NOW(), NOW())
              RETURNING id
            `, [
              doctor.firstName,
              doctor.lastName,
              `${doctor.firstName.toLowerCase()}.${doctor.lastName.toLowerCase()}@clinic.com`,
              '(087) 811-0000',
              '$2b$10$default.password.hash.for.doctors'
            ]);

            const userId = userResult.rows[0].id;

            // Create doctor record
            await pool.query(`
              INSERT INTO doctors (user_id, clinic_id, specialization, license_number, years_experience, consultation_fee, status, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
            `, [userId, clinic.id, doctor.specialization, `LICENSE-${Date.now()}`, 5, 800]);

            console.log(`  ✓ Added Dr. ${doctor.firstName} ${doctor.lastName} to ${clinic.name}`);
          }
        } catch (err) {
          console.log(`  - Dr. ${doctor.firstName} ${doctor.lastName} already exists or error: ${err.message}`);
        }
      }
    }

    // Final verification
    console.log('\n=== FINAL VERIFICATION ===\n');
    for (const clinic of clinics) {
      const servicesCount = await pool.query(`
        SELECT COUNT(*) as count FROM clinic_services WHERE clinic_id = $1
      `, [clinic.id]);

      const doctorsCount = await pool.query(`
        SELECT COUNT(*) as count FROM doctors WHERE clinic_id = $1 AND status = 'active'
      `, [clinic.id]);

      console.log(`${clinic.name}:`);
      console.log(`  - Services: ${servicesCount.rows[0].count}`);
      console.log(`  - Doctors: ${doctorsCount.rows[0].count}`);
    }

    console.log('\n✅ Data verification and population complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

verifyAndPopulateData();
