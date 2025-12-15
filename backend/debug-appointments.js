require('dotenv').config();
const pool = require('./utils/database');

async function debugAppointments() {
  try {
    console.log('🔍 Debugging appointment data and admin visibility...');
    
    // Check recent appointments
    const recentAppointments = await pool.query(`
      SELECT a.*, u.email as user_email, u.first_name, u.last_name, c.name as clinic_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN clinics c ON a.clinic_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log(`\n📋 Recent appointments (${recentAppointments.rows.length}):`);
    recentAppointments.rows.forEach((apt, index) => {
      console.log(`${index + 1}. ID: ${apt.id}`);
      console.log(`   Patient: ${apt.first_name} ${apt.last_name} (${apt.email})`);
      console.log(`   User ID: ${apt.user_id}`);
      console.log(`   Email: ${apt.user_email || 'N/A'}`);
      console.log(`   Clinic: ${apt.clinic_name || 'N/A'}`);
      console.log(`   Service: ${apt.service}`);
      console.log(`   Date: ${apt.appointment_date}`);
      console.log(`   Time: ${apt.appointment_time}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Created: ${apt.created_at}`);
      console.log('');
    });
    
    // Test admin API endpoint directly
    console.log('🧪 Testing admin API endpoint...');
    try {
      const adminResult = await pool.query(`
        SELECT a.*, c.name as clinic_name, u.first_name, u.last_name, u.email
        FROM appointments a
        JOIN clinics c ON a.clinic_id = c.id
        JOIN users u ON a.user_id = u.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT 3
      `);
      
      console.log(`✅ Admin query returns ${adminResult.rows.length} appointments`);
      adminResult.rows.forEach(apt => {
        console.log(`   - ${apt.first_name} ${apt.last_name} (${apt.email}) - ${apt.clinic_name}`);
      });
      
    } catch (error) {
      console.error('❌ Admin query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    process.exit(0);
  }
}

debugAppointments();
