require('dotenv').config();
const gmailEmailService = require('./utils/services-gmail');

// Test Gmail email service
async function testGmailEmail() {
  console.log('🧪 Testing Gmail Email Service...');
  console.log('📧 Environment variables:');
  console.log('  GMAIL_SENDER_EMAIL:', process.env.GMAIL_SENDER_EMAIL || '❌ Missing');
  console.log('  GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
  
  try {
    const testData = {
      appointment: {
        id: 'GMAIL-TEST-' + Date.now(),
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

    console.log('📤 Sending test email via Gmail to:', testData.appointment.email);
    
    const result = await gmailEmailService.sendEmail({
      to: testData.appointment.email,
      subject: '🧪 Gmail Test - ClinicBook Email Service',
      template: 'appointment-confirmation',
      data: testData,
      includePDF: false // Don't include PDF for test
    });

    console.log('✅ Gmail email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📨 Check inbox at:', testData.appointment.email);
    
  } catch (error) {
    console.error('❌ Gmail email test failed:', error.message);
    console.error('🔍 Full error:', error);
    
    // Diagnose specific issues
    if (error.message.includes('authentication')) {
      console.log('💡 Check: Gmail credentials (app password)');
    }
    if (error.message.includes('less secure')) {
      console.log('💡 Enable: "Less secure app access" in Gmail settings');
    }
    if (error.message.includes('535')) {
      console.log('💡 Fix: Use Gmail App Password instead of regular password');
    }
  }
}

// Run test
testGmailEmail();
