require('dotenv').config();
const { sendEmail } = require('./utils/services-free');

// Test direct email to patient address
async function testPatientEmail() {
  console.log('🧪 Testing direct email to patient address...');
  
  try {
    const testData = {
      appointment: {
        id: 'TEST-' + Date.now(),
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '2:00 PM',
        service: 'Test Consultation',
        first_name: 'Test',
        last_name: 'Patient',
        email: 'cuerboprince13@gmail.com' // Actual patient email
      },
      clinic: {
        name: 'Test Clinic',
        address: '123 Test St, Test City',
        phone: '(555) 123-4567'
      }
    };

    console.log('📤 Sending test email to actual patient:', testData.appointment.email);
    
    const result = await sendEmail({
      to: testData.appointment.email, // This should now go to actual patient
      subject: '🧪 Test Email - Actual Patient Address',
      template: 'appointment-confirmation',
      data: testData,
      includePDF: false // Don't include PDF for test
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result);
    console.log('📨 Check Resend dashboard for email to:', testData.appointment.email);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('🔍 This is expected with Resend trial - can only send to verified addresses');
    
    if (error.message.includes('only send testing emails')) {
      console.log('💡 Resend trial limitation detected');
      console.log('💡 To send to actual patients, you need to:');
      console.log('   1. Verify a custom domain at resend.com/domains');
      console.log('   2. Update RESEND_FROM_EMAIL to use your domain');
      console.log('   3. Or switch to Gmail SMTP for testing');
    }
  }
}

// Run test
testPatientEmail();
