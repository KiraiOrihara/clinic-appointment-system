require('dotenv').config();
const pool = require('./utils/database');

async function checkAndReduceServices() {
  try {
    console.log('=== CHECKING CURRENT SERVICE DISTRIBUTION ===\n');
    
    // Check current distribution
    const checkQuery = `
      SELECT c.id, c.name, COUNT(cs.service_id) as service_count,
             ARRAY_AGG(s.name ORDER BY s.name) as services
      FROM clinics c
      LEFT JOIN clinic_services cs ON c.id = cs.clinic_id
      LEFT JOIN services s ON cs.service_id = s.id
      GROUP BY c.id, c.name
      ORDER BY service_count DESC
    `;
    
    const checkResult = await pool.query(checkQuery);
    console.log('Current service distribution:');
    checkResult.rows.forEach(row => {
      console.log(`Clinic ${row.id} (${row.name}): ${row.service_count} services`);
      if (row.services && row.services.length > 0) {
        console.log(`  Services: ${row.services.slice(0, 5).join(', ')}`);
        if (row.services.length > 5) {
          console.log(`  ... and ${row.services.length - 5} more (to be removed)`);
        }
      }
      console.log('');
    });
    
    // Reduce services to maximum 5 per clinic
    console.log('=== REDUCING SERVICES TO MAXIMUM 5 PER CLINIC ===\n');
    
    for (const clinic of checkResult.rows) {
      if (clinic.service_count > 5) {
        console.log(`Reducing services for Clinic ${clinic.id} (${clinic.name}) from ${clinic.service_count} to 5`);
        
        // Get all service IDs for this clinic
        const servicesQuery = `
          SELECT cs.service_id, s.name
          FROM clinic_services cs
          JOIN services s ON cs.service_id = s.id
          WHERE cs.clinic_id = $1
          ORDER BY s.name
        `;
        
        const servicesResult = await pool.query(servicesQuery, [clinic.id]);
        
        // Keep first 5, remove the rest
        const servicesToKeep = servicesResult.rows.slice(0, 5);
        const servicesToRemove = servicesResult.rows.slice(5);
        
        console.log(`  Keeping: ${servicesToKeep.map(s => s.name).join(', ')}`);
        console.log(`  Removing: ${servicesToRemove.map(s => s.name).join(', ')}`);
        
        // Remove excess services
        for (const service of servicesToRemove) {
          const deleteQuery = `
            DELETE FROM clinic_services 
            WHERE clinic_id = $1 AND service_id = $2
          `;
          await pool.query(deleteQuery, [clinic.id, service.service_id]);
        }
        
        console.log(`  ✓ Reduced to ${servicesToKeep.length} services\n`);
      } else {
        console.log(`Clinic ${clinic.id} (${clinic.name}) already has ${clinic.service_count} services (≤5) - no change needed\n`);
      }
    }
    
    // Verify final distribution
    console.log('=== FINAL SERVICE DISTRIBUTION ===\n');
    const finalResult = await pool.query(checkQuery);
    console.log('Final service distribution:');
    finalResult.rows.forEach(row => {
      console.log(`Clinic ${row.id} (${row.name}): ${row.service_count} services`);
      if (row.services && row.services.length > 0) {
        console.log(`  Services: ${row.services.join(', ')}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndReduceServices();
