require('dotenv').config();
const { sendEmail } = require('./utils/services-free');

// Test email service
async function testEmailService() {
  console.log('🔍 Testing Resend Email Service...');
  console.log('📧 Environment variables:');
  console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('  RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ Missing');
  
  try {
    const testData = {
      appointment: {
        id: 'TEST-' + Date.now(),
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '10:00 AM',
        service: 'Test Consultation',
        first_name: 'Test',
        last_name: 'User',
        email: 'arizarhenzon@gmail.com'
      },
      clinic: {
        name: 'Test Clinic',
        address: '123 Test St, Test City',
        phone: '(555) 123-4567'
      }
    };

    console.log('📤 Sending test email...');
    const result = await sendEmail({
      to: 'arizarhenzon322@gmail.com', // Use verified Resend account email
      subject: '🧪 Test Email - ClinicBook Diagnostic',
      template: 'appointment-confirmation',
      data: testData,
      includePDF: false // Don't include PDF for test
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Email ID:', result);
    console.log('📨 Check your inbox and Resend dashboard');
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('🔍 Full error:', error);
    
    // Diagnose specific issues
    if (error.message.includes('API key')) {
      console.log('💡 Check: Is RESEND_API_KEY valid?');
    }
    if (error.message.includes('domain')) {
      console.log('💡 Check: Is sending domain verified?');
    }
    if (error.message.includes('rate limit')) {
      console.log('💡 Check: Have you hit rate limits?');
    }
  }
}

// Run test
testEmailService();
