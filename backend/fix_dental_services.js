require('dotenv').config();
const pool = require('./utils/database');

async function fixDentalServices() {
  try {
    console.log('Fixing dental services distribution...');

    // Get Mati City Dental Clinic ID
    const dentalClinicResult = await pool.query('SELECT id FROM clinics WHERE name = $1', ['Mati City Dental Clinic']);
    const dentalClinicId = dentalClinicResult.rows[0]?.id;
    
    if (!dentalClinicId) {
      console.error('Mati City Dental Clinic not found');
      return;
    }
    
    console.log(`Mati City Dental Clinic ID: ${dentalClinicId}`);

    // Get all other clinics
    const otherClinicsResult = await pool.query('SELECT id, name FROM clinics WHERE name != $1', ['Mati City Dental Clinic']);
    const otherClinics = otherClinicsResult.rows;
    
    console.log(`Found ${otherClinics.length} other clinics to remove dental services from`);

    // Define dental services
    const dentalServices = [
      'Dental Cleaning',
      'Tooth Extraction', 
      'Orthodontics',
      'Dental Check-up',
      'Dental Surgery',
      'Cosmetic Dentistry'
    ];

    // Get service IDs for dental services
    const dentalServiceIds = [];
    for (const serviceName of dentalServices) {
      const serviceResult = await pool.query('SELECT id FROM services WHERE name = $1', [serviceName]);
      if (serviceResult.rows.length > 0) {
        dentalServiceIds.push(serviceResult.rows[0].id);
      }
    }
    
    console.log(`Found ${dentalServiceIds.length} dental services`);

    // Remove dental services from all other clinics
    for (const clinic of otherClinics) {
      console.log(`\nRemoving dental services from: ${clinic.name}`);
      
      for (const serviceId of dentalServiceIds) {
        const deleteResult = await pool.query(
          'DELETE FROM clinic_services WHERE clinic_id = $1 AND service_id = $2',
          [clinic.id, serviceId]
        );
        
        if (deleteResult.rowCount > 0) {
          console.log(`  - Removed dental service from ${clinic.name}`);
        }
      }
    }

    // Add all dental services to Mati City Dental Clinic
    console.log(`\nAdding dental services to Mati City Dental Clinic...`);
    
    for (const serviceName of dentalServices) {
      try {
        // Get service ID
        const serviceResult = await pool.query('SELECT id FROM services WHERE name = $1', [serviceName]);
        if (serviceResult.rows.length === 0) {
          console.log(`  - Service ${serviceName} not found, skipping`);
          continue;
        }
        
        const serviceId = serviceResult.rows[0].id;
        
        // Add service to dental clinic
        await pool.query(`
          INSERT INTO clinic_services (clinic_id, service_id, created_at, updated_at)
          VALUES ($1, $2, NOW(), NOW())
          ON CONFLICT (clinic_id, service_id) DO NOTHING
        `, [dentalClinicId, serviceId]);
        
        console.log(`  + Added ${serviceName} to Mati City Dental Clinic`);
      } catch (error) {
        console.log(`  - ${serviceName} already exists or error: ${error.message}`);
      }
    }

    // Verify the results
    console.log('\n--- Verification ---');
    
    // Check Mati City Dental Clinic services
    const dentalClinicServices = await pool.query(`
      SELECT s.name 
      FROM services s
      JOIN clinic_services cs ON s.id = cs.service_id
      WHERE cs.clinic_id = $1
      ORDER BY s.name
    `, [dentalClinicId]);
    
    console.log(`\nMati City Dental Clinic services (${dentalClinicServices.rows.length}):`);
    dentalClinicServices.rows.forEach(service => {
      console.log(`  - ${service.name}`);
    });

    // Check a few other clinics to ensure dental services are removed
    const sampleClinics = otherClinics.slice(0, 3);
    for (const clinic of sampleClinics) {
      const clinicServices = await pool.query(`
        SELECT s.name 
        FROM services s
        JOIN clinic_services cs ON s.id = cs.service_id
        WHERE cs.clinic_id = $1 AND s.name = ANY($2)
      `, [clinic.id, dentalServices]);
      
      console.log(`\n${clinic.name} - Dental services found: ${clinicServices.rows.length}`);
      clinicServices.rows.forEach(service => {
        console.log(`  - ${service.name}`);
      });
    }

    console.log('\nDental services distribution fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing dental services:', error);
  } finally {
    await pool.end();
  }
}

fixDentalServices();
