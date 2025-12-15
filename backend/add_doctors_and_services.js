require('dotenv').config();
const pool = require('./utils/database');

async function addDoctorsAndServices() {
  try {
    console.log('Adding doctors and services to clinics...');

    // Get clinic IDs
    const clinicsResult = await pool.query(`
      SELECT id, name FROM clinics 
      WHERE name IN ('Mati City Dental Clinic', 'Mati Doctors Hospital', 'Community Health Center - Mati', 'Davao Oriental Medical Clinic')
    `);
    
    const clinics = {};
    clinicsResult.rows.forEach(clinic => {
      clinics[clinic.name] = clinic.id;
    });

    console.log('Found clinics:', clinics);

    // Doctors and Services data
    const doctorsData = [
      // Mati City Dental Clinic
      {
        clinic_id: clinics['Mati City Dental Clinic'],
        doctors: [
          { name: 'Dr. Maria Santos', specialization: 'General Dentistry', email: 'maria.santos@maticity.gov.ph', phone: '(087) 811-3457' },
          { name: 'Dr. Juan Reyes', specialization: 'Orthodontics', email: 'juan.reyes@maticity.gov.ph', phone: '(087) 811-3458' }
        ],
        services: [
          { name: 'Dental Cleaning', description: 'Professional teeth cleaning and polishing', duration: 30, price: 500 },
          { name: 'Tooth Extraction', description: 'Safe and painless tooth removal', duration: 45, price: 1500 }
        ]
      },
      // Mati Doctors Hospital
      {
        clinic_id: clinics['Mati Doctors Hospital'],
        doctors: [
          { name: 'Dr. Ana Cruz', specialization: 'Internal Medicine', email: 'ana.cruz@matidoctors.com', phone: '(087) 811-7891' },
          { name: 'Dr. Roberto Lee', specialization: 'General Surgery', email: 'roberto.lee@matidoctors.com', phone: '(087) 811-7892' }
        ],
        services: [
          { name: 'General Consultation', description: 'Comprehensive medical examination', duration: 30, price: 800 },
          { name: 'Minor Surgery', description: 'Outpatient surgical procedures', duration: 60, price: 5000 }
        ]
      },
      // Community Health Center
      {
        clinic_id: clinics['Community Health Center - Mati'],
        doctors: [
          { name: 'Dr. Elena Martinez', specialization: 'Family Medicine', email: 'elena.martinez@maticity.gov.ph', phone: '(087) 811-2023' },
          { name: 'Dr. Carlos Garcia', specialization: 'Pediatrics', email: 'carlos.garcia@maticity.gov.ph', phone: '(087) 811-2024' }
        ],
        services: [
          { name: 'Vaccination', description: 'Immunization services for all ages', duration: 15, price: 0 },
          { name: 'Health Check-up', description: 'Basic health screening', duration: 20, price: 0 }
        ]
      },
      // Davao Oriental Medical Clinic
      {
        clinic_id: clinics['Davao Oriental Medical Clinic'],
        doctors: [
          { name: 'Dr. Patricia Lim', specialization: 'General Practice', email: 'patricia.lim@davaoorientalmed.com', phone: '(087) 811-2346' },
          { name: 'Dr. Michael Tan', specialization: 'Cardiology', email: 'michael.tan@davaoorientalmed.com', phone: '(087) 811-2347' }
        ],
        services: [
          { name: 'Medical Consultation', description: 'General medical consultation', duration: 30, price: 600 },
          { name: 'ECG Test', description: 'Electrocardiogram heart test', duration: 20, price: 1200 }
        ]
      }
    ];

    // Add doctors and services for each clinic
    for (const clinicData of doctorsData) {
      if (clinicData.clinic_id) {
        console.log(`Processing clinic ID: ${clinicData.clinic_id}`);
        
        // Add doctors (need to create users first, then doctors)
        for (const doctor of clinicData.doctors) {
          // Create user first
          const nameParts = doctor.name.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || 'Doctor';
          
          const userResult = await pool.query(`
            INSERT INTO users (first_name, last_name, email, phone, password, role, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, 'doctor', NOW(), NOW())
            RETURNING id
          `, [firstName, lastName, doctor.email, doctor.phone, '$2b$10$default.password.hash.for.doctors']);
          
          const userId = userResult.rows[0].id;
          
          // Then create doctor record
          const doctorResult = await pool.query(`
            INSERT INTO doctors (user_id, clinic_id, specialization, license_number, years_experience, consultation_fee, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
            RETURNING id
          `, [userId, clinicData.clinic_id, doctor.specialization, 'LICENSE-' + Date.now(), 5, 800]);
          
          console.log(`Added doctor: ${doctor.name} with user ID: ${userId} and doctor ID: ${doctorResult.rows[0].id}`);
        }
        
        // Add services (services table doesn't have clinic_id, so we'll add them as general services)
        for (const service of clinicData.services) {
          try {
            const serviceResult = await pool.query(`
              INSERT INTO services (name, description, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW())
              RETURNING id
            `, [service.name, service.description]);
            
            console.log(`Added service: ${service.name} with ID: ${serviceResult.rows[0].id}`);
          } catch (err) {
            if (err.code === '23505') { // Unique constraint violation
              console.log(`Service already exists: ${service.name} - skipping`);
            } else {
              throw err;
            }
          }
        }
      }
    }

    console.log('Successfully added doctors and services!');
    
    // Verify clinic toggle functionality
    console.log('Testing clinic toggle functionality...');
    const toggleTest = await pool.query(`
      SELECT id, name, status FROM clinics 
      WHERE name IN ('Mati City Dental Clinic', 'Mati Doctors Hospital', 'Community Health Center - Mati', 'Davao Oriental Medical Clinic')
    `);
    
    console.log('Clinic status for toggle test:');
    toggleTest.rows.forEach(clinic => {
      console.log(`${clinic.name}: ${clinic.status}`);
    });

  } catch (error) {
    console.error('Error adding doctors and services:', error);
  } finally {
    await pool.end();
  }
}

addDoctorsAndServices();
