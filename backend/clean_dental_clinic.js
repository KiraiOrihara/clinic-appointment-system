require('dotenv').config();
const pool = require('./utils/database');

async function cleanDentalClinic() {
  try {
    console.log('Cleaning Mati City Dental Clinic to have only dental services...');

    // Get Mati City Dental Clinic ID
    const dentalClinicResult = await pool.query('SELECT id FROM clinics WHERE name = $1', ['Mati City Dental Clinic']);
    const dentalClinicId = dentalClinicResult.rows[0]?.id;
    
    if (!dentalClinicId) {
      console.error('Mati City Dental Clinic not found');
      return;
    }
    
    console.log(`Mati City Dental Clinic ID: ${dentalClinicId}`);

    // Define dental services (only these should remain)
    const dentalServices = [
      'Dental Cleaning',
      'Tooth Extraction', 
      'Orthodontics',
      'Dental Check-up',
      'Dental Surgery',
      'Cosmetic Dentistry'
    ];

    // Get all current services for Mati City Dental Clinic
    const currentServicesResult = await pool.query(`
      SELECT s.id, s.name 
      FROM services s
      JOIN clinic_services cs ON s.id = cs.service_id
      WHERE cs.clinic_id = $1
      ORDER BY s.name
    `, [dentalClinicId]);
    
    console.log(`\nCurrent services in Mati City Dental Clinic (${currentServicesResult.rows.length}):`);
    currentServicesResult.rows.forEach(service => {
      console.log(`  - ${service.name}`);
    });

    // Remove non-dental services
    console.log('\nRemoving non-dental services...');
    let removedCount = 0;
    
    for (const service of currentServicesResult.rows) {
      if (!dentalServices.includes(service.name)) {
        await pool.query(
          'DELETE FROM clinic_services WHERE clinic_id = $1 AND service_id = $2',
          [dentalClinicId, service.id]
        );
        console.log(`  - Removed: ${service.name}`);
        removedCount++;
      }
    }

    // Ensure all dental services are present
    console.log('\nEnsuring all dental services are present...');
    let addedCount = 0;
    
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
        
        console.log(`  + Ensured: ${serviceName}`);
        addedCount++;
      } catch (error) {
        console.log(`  - ${serviceName} already exists`);
      }
    }

    // Final verification
    console.log('\n--- Final Verification ---');
    
    const finalServicesResult = await pool.query(`
      SELECT s.name 
      FROM services s
      JOIN clinic_services cs ON s.id = cs.service_id
      WHERE cs.clinic_id = $1
      ORDER BY s.name
    `, [dentalClinicId]);
    
    console.log(`\nMati City Dental Clinic final services (${finalServicesResult.rows.length}):`);
    finalServicesResult.rows.forEach(service => {
      console.log(`  - ${service.name}`);
    });

    console.log(`\nSummary:`);
    console.log(`  - Removed ${removedCount} non-dental services`);
    console.log(`  - Ensured ${addedCount} dental services`);
    console.log(`  - Final count: ${finalServicesResult.rows.length} services`);
    
    console.log('\nMati City Dental Clinic now only has dental services!');

  } catch (error) {
    console.error('Error cleaning dental clinic:', error);
  } finally {
    await pool.end();
  }
}

cleanDentalClinic();
