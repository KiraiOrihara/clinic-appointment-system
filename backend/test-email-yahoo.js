require('dotenv').config();
const gmailEmailService = require('./utils/services-gmail');

// Test email delivery to Yahoo address
async function testYahooEmail() {
  console.log('🧪 Testing email delivery to Yahoo...');
  
  try {
    const result = await gmailEmailService.sendEmail({
      to: 'razor_rhenzon@yahoo.com',
      subject: 'Clinic Booking - Test Email to Yahoo',
      template: 'appointment-confirmation',
      data: {
        patientName: 'Ariza Rhenzon',
        clinicName: 'Test Clinic',
        appointment: {
          id: 'TEST123',
          appointment_date: '2025-12-12',
          appointment_time: '4:00 PM',
          service: 'Test Service'
        },
        clinic: {
          name: 'Test Clinic',
          address: '123 Test St, Test City',
          phone: '555-123-4567'
        }
      }
    });
    
    console.log('✅ Email sent successfully to razor_rhenzon@yahoo.com');
    console.log('📧 Message ID:', result.messageId);
    console.log('📋 Response:', result.response);
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.error('🔍 Error details:', error);
  }
}

testYahooEmail();
