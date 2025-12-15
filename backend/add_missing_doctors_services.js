require('dotenv').config();
const pool = require('./utils/database');

async function addMissingDoctorsAndServices() {
  try {
    console.log('Adding missing doctors and services to all clinics...');

    // Get all clinics
    const clinicsResult = await pool.query('SELECT id, name FROM clinics');
    const clinics = {};
    clinicsResult.rows.forEach(clinic => {
      clinics[clinic.name] = clinic.id;
    });

    console.log('Found clinics:', clinics);

    // Complete doctors and services data for all clinics
    const clinicsData = [
      // St. Camillus Hospital of Mati Foundation
      {
        clinic_id: clinics['St. Camillus Hospital of Mati Foundation'],
        doctors: [
          { name: 'Dr. Rafael Santos', specialization: 'General Practice', email: 'rafael.santos@stcamillus.com', phone: '(087) 811-0366' },
          { name: 'Dr. Liza Cruz', specialization: 'Gynecology', email: 'liza.cruz@stcamillus.com', phone: '(087) 811-0367' }
        ],
        services: [
          { name: 'General Practice', description: 'Comprehensive medical consultations and primary care' },
          { name: 'Gynecology', description: 'Women\'s health and reproductive care services' },
          { name: 'Dermatology', description: 'Skin care and dermatological treatments' },
          { name: 'Emergency Care', description: '24/7 emergency medical services' }
        ]
      },
      // Mati Medical Specialist & Diagnostic Center
      {
        clinic_id: clinics['Mati Medical Specialist & Diagnostic Center'],
        doctors: [
          { name: 'Dr. Antonio Reyes', specialization: 'Diagnostics', email: 'antonio.reyes@matimedical.com', phone: '(087) 811-4568' },
          { name: 'Dr. Maria Lopez', specialization: 'Orthopedics', email: 'maria.lopez@matimedical.com', phone: '(087) 811-4569' }
        ],
        services: [
          { name: 'Diagnostics', description: 'Advanced diagnostic imaging and laboratory tests' },
          { name: 'Orthopedics', description: 'Bone and joint care services' },
          { name: 'Ophthalmology', description: 'Eye care and vision services' },
          { name: 'X-Ray Services', description: 'Digital radiography and imaging' }
        ]
      },
      // Mati Doctors Hospital (already has doctors, add services)
      {
        clinic_id: clinics['Mati Doctors Hospital'],
        doctors: [], // Already has doctors
        services: [
          { name: 'Emergency Services', description: '24/7 emergency medical care' },
          { name: 'Inpatient Care', description: 'Hospital admission and care services' },
          { name: 'Surgery', description: 'Major and minor surgical procedures' },
          { name: 'Laboratory', description: 'Clinical laboratory and pathology services' }
        ]
      },
      // Mati City Dental Clinic (already has doctors, add services)
      {
        clinic_id: clinics['Mati City Dental Clinic'],
        doctors: [], // Already has doctors
        services: [
          { name: 'Dental Check-up', description: 'Routine dental examination and cleaning' },
          { name: 'Orthodontics', description: 'Braces and teeth alignment services' },
          { name: 'Dental Surgery', description: 'Oral surgical procedures' },
          { name: 'Cosmetic Dentistry', description: 'Teeth whitening and aesthetic dental services' }
        ]
      },
      // Mati City Health Office
      {
        clinic_id: clinics['Mati City Health Office'],
        doctors: [
          { name: 'Dr. Jose Martinez', specialization: 'General Practice', email: 'jose.martinez@maticity.gov.ph', phone: '(087) 811-2023' },
          { name: 'Dr. Rosa Santos', specialization: 'Preventive Care', email: 'rosa.santos@maticity.gov.ph', phone: '(087) 811-2024' }
        ],
        services: [
          { name: 'Vaccination', description: 'Immunizations and vaccine administration' },
          { name: 'Preventive Care', description: 'Preventive health screenings and check-ups' },
          { name: 'General Practice', description: 'Primary care and general consultations' },
          { name: 'Health Education', description: 'Public health education and awareness programs' }
        ]
      },
      // Davao Oriental Provincial Medical Center
      {
        clinic_id: clinics['Davao Oriental Provincial Medical Center'],
        doctors: [
          { name: 'Dr. Fernando Reyes', specialization: 'General Practice', email: 'fernando.reyes@dopmc.gov.ph', phone: '(087) 811-2025' },
          { name: 'Dr. Cristina Cruz', specialization: 'Pediatrics', email: 'cristina.cruz@dopmc.gov.ph', phone: '(087) 811-2026' }
        ],
        services: [
          { name: 'General Practice', description: 'Comprehensive medical consultations and primary care' },
          { name: 'Pediatrics', description: 'Child and adolescent healthcare services' },
          { name: 'Cardiology', description: 'Heart and cardiovascular care services' },
          { name: 'Emergency Medicine', description: 'Emergency and trauma care services' }
        ]
      },
      // Davao Oriental Medical Clinic (already has doctors, add services)
      {
        clinic_id: clinics['Davao Oriental Medical Clinic'],
        doctors: [], // Already has doctors
        services: [
          { name: 'Medical Consultation', description: 'General medical consultations and examinations' },
          { name: 'ECG Test', description: 'Electrocardiogram and cardiac testing' },
          { name: 'Blood Tests', description: 'Laboratory blood testing and analysis' },
          { name: 'Physical Examination', description: 'Complete physical health examinations' }
        ]
      },
      // Community Health Center - Mati (already has doctors, add services)
      {
        clinic_id: clinics['Community Health Center - Mati'],
        doctors: [], // Already has doctors
        services: [
          { name: 'Community Health Services', description: 'Public health programs and services' },
          { name: 'Maternal Health', description: 'Pregnancy and maternal care services' },
          { name: 'Child Health', description: 'Pediatric and child wellness services' },
          { name: 'Health Screening', description: 'Community health screening programs' }
        ]
      }
    ];

    // Add doctors and services for each clinic
    for (const clinicData of clinicsData) {
      if (clinicData.clinic_id) {
        console.log(`\nProcessing clinic ID: ${clinicData.clinic_id}`);
        
        // Add doctors
        for (const doctor of clinicData.doctors) {
          try {
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
          } catch (err) {
            if (err.code === '23505') {
              console.log(`Doctor already exists: ${doctor.name} - skipping`);
            } else {
              console.error(`Error adding doctor ${doctor.name}:`, err.message);
            }
          }
        }
        
        // Add services
        for (const service of clinicData.services) {
          try {
            const serviceResult = await pool.query(`
              INSERT INTO services (name, description, created_at, updated_at)
              VALUES ($1, $2, NOW(), NOW())
              RETURNING id
            `, [service.name, service.description]);
            
            console.log(`Added service: ${service.name} with ID: ${serviceResult.rows[0].id}`);
          } catch (err) {
            if (err.code === '23505') {
              console.log(`Service already exists: ${service.name} - skipping`);
            } else {
              console.error(`Error adding service ${service.name}:`, err.message);
            }
          }
        }
      }
    }

    console.log('\nSuccessfully added missing doctors and services!');
    
    // Final verification
    console.log('\nFinal verification of all clinics:');
    const finalClinics = await pool.query('SELECT id, name, status FROM clinics ORDER BY name');
    finalClinics.rows.forEach(clinic => {
      console.log(`${clinic.name} (ID: ${clinic.id}): ${clinic.status}`);
    });

  } catch (error) {
    console.error('Error adding missing doctors and services:', error);
  } finally {
    await pool.end();
  }
}

addMissingDoctorsAndServices();
