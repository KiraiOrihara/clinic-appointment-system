require('dotenv').config();
const { sendAppointmentConfirmationEmail } = require('./utils/resendEmailService');

/**
 * Test script for Resend appointment confirmation email
 * Usage: node test-resend-email.js
 */

async function testResendEmail() {
  console.log('🧪 Testing Resend Appointment Confirmation Email Service\n');

  // Mock data
  const testEmail = 'test@example.com'; // Change this to your test email
  const mockAppointment = {
    id: 12345,
    first_name: 'John',
    last_name: 'Doe',
    email: testEmail,
    phone: '(087) 123-4567',
    appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    appointment_time: '10:30 AM',
    service: 'General Consultation',
    reason: 'Regular checkup'
  };

  const mockClinic = {
    id: 1,
    name: 'Mati City Medical Center',
    address: 'Mati City, Davao Oriental',
    phone: '(087) 555-1234',
    email: 'info@matimedical.com'
  };

  const mockPatient = {
    firstName: 'John',
    lastName: 'Doe',
    email: testEmail,
    phone: '(087) 123-4567'
  };

  try {
    console.log('📧 Sending test appointment confirmation email...\n');
    console.log(`   Recipient: ${testEmail}`);
    console.log(`   Clinic: ${mockClinic.name}`);
    console.log(`   Date: ${mockAppointment.appointment_date.toLocaleDateString()}`);
    console.log(`   Time: ${mockAppointment.appointment_time}\n`);

    const result = await sendAppointmentConfirmationEmail(
      testEmail,
      mockAppointment,
      mockClinic,
      mockPatient
    );

    if (result.success) {
      console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
      console.log('📋 Email Details:');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Recipient: ${result.recipient}`);
      console.log(`   Confirmation #: ${result.confirmationNumber}`);
      console.log(`   Timestamp: ${result.timestamp}`);
      console.log('\n📍 Check your Resend dashboard to verify the email was sent.');
    } else {
      console.log('❌ EMAIL FAILED TO SEND\n');
      console.log(`Error: ${result.error}`);
      console.log('\n⚠️  Make sure:');
      console.log('   1. RESEND_API_KEY is set in .env file');
      console.log('   2. RESEND_FROM_EMAIL is set in .env file');
      console.log('   3. Your Resend account is properly configured');
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('\nError Details:', error);
  }
}

// Run test
testResendEmail();
