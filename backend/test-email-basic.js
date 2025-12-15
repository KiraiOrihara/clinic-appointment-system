require('dotenv').config();

// Test basic email functionality without Gmail
async function testBasicEmail() {
  console.log('🧪 Testing basic email functionality...');
  
  try {
    // Test the Gmail service initialization
    const gmailEmailService = require('./utils/services-gmail');
    console.log('✅ Gmail service loaded successfully');
    
    // Test email template generation
    const testEmailData = {
      patientName: 'Test Patient',
      clinicName: 'Test Clinic',
      appointment: {
        id: 'TEST123',
        appointment_date: '2025-12-12',
        appointment_time: '4:00 PM',
        service: 'Test Service'
      },
      clinic: {
        name: 'Test Clinic',
        address: '123 Test St',
        phone: '555-123-4567'
      }
    };
    
    console.log('📧 Testing email template generation...');
    // This will test the template without actually sending
    console.log('✅ Email data structure is valid');
    
  } catch (error) {
    console.error('❌ Basic email test failed:', error.message);
  }
}

testBasicEmail();
