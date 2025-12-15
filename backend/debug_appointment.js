require('dotenv').config();
const pool = require('./utils/database');

async function debugAppointment() {
  try {
    console.log('🔍 Checking database connection and recent appointments...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Check recent appointments
    const recentAppointments = await client.query(`
      SELECT 
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.service,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        c.name as clinic_name,
        c.address as clinic_address
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Recent Appointments:');
    console.log('==========================');
    
    if (recentAppointments.rows.length === 0) {
      console.log('❌ No appointments found in the database');
    } else {
      recentAppointments.rows.forEach((apt, index) => {
        console.log(`\n${index + 1}. Appointment ID: ${apt.id}`);
        console.log(`   👤 Patient: ${apt.first_name} ${apt.last_name}`);
        console.log(`   📧 Email: ${apt.email}`);
        console.log(`   🏥 Clinic: ${apt.clinic_name}`);
        console.log(`   📅 Date: ${apt.appointment_date} at ${apt.appointment_time}`);
        console.log(`   📋 Service: ${apt.service}`);
        console.log(`   ✅ Status: ${apt.status}`);
        console.log(`   🕐 Created: ${apt.created_at}`);
        
        // Check if email should have been sent
        const isRecent = new Date(apt.created_at) > new Date(Date.now() - 10 * 60 * 1000); // Last 10 minutes
        console.log(`   📧 Email Status: ${isRecent ? '🔄 Should have been sent recently' : '⏰ Older appointment'}`);
      });
    }
    
    // Check email service configuration
    console.log('\n📧 Email Service Configuration:');
    console.log('===============================');
    console.log(`🔑 Resend API Key: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`📤 From Email: ${process.env.RESEND_FROM_EMAIL || '❌ Not configured'}`);
    console.log(`📧 Fallback Email: ${process.env.FROM_EMAIL || '❌ Not configured'}`);
    
    // Test email service status
    try {
      const services = require('./utils/services-free');
      console.log('📦 Email Service Module: ✅ Loaded successfully');
      
      // Check if Resend client is initialized
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
        console.log('🔄 Resend Client: ✅ Should be initialized');
      } else {
        console.log('❌ Resend Client: Not properly configured');
      }
    } catch (error) {
      console.log('❌ Email Service Module: Failed to load -', error.message);
    }
    
    console.log('\n🔍 Expected Email Log Messages:');
    console.log('===============================');
    console.log('✅ "Email sent via Resend to [email] with PDF attachment: true"');
    console.log('❌ "Email send error (appointment still created): [error message]"');
    console.log('❌ "Resend email send error: [error message]"');
    
    console.log('\n📊 Troubleshooting Tips:');
    console.log('========================');
    console.log('1. Check if backend server is running');
    console.log('2. Look for email log messages in backend console');
    console.log('3. Verify email address matches: arizarhenzon322@gmail.com');
    console.log('4. Check Resend dashboard at https://resend.com/dashboard');
    console.log('5. Check email inbox and spam folder');
    
    client.release();
    console.log('\n✅ Database check completed');
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    process.exit(0);
  }
}

debugAppointment();
