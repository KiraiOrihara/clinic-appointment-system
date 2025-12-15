require('dotenv').config();
const nodemailer = require('nodemailer');

// Simple Gmail authentication test
async function testGmailAuth() {
  console.log('🧪 Testing Gmail authentication...');
  
  try {
    // Create transporter with current credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    
    console.log('📧 Gmail User:', process.env.GMAIL_USER);
    console.log('🔑 Gmail Pass (first 4 chars):', process.env.GMAIL_PASS?.substring(0, 4) + '...');
    
    // Verify connection
    console.log('🔍 Verifying Gmail connection...');
    await transporter.verify();
    
    console.log('✅ Gmail authentication successful!');
    
    // Test sending a simple email
    console.log('📤 Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'razor_rhenzon@yahoo.com',
      subject: 'Clinic Booking - Simple Test Email',
      text: 'This is a simple test email from Clinic Booking system.',
      html: '<p>This is a simple test email from <strong>Clinic Booking</strong> system.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Gmail authentication failed:', error.message);
    console.error('🔍 Error code:', error.code);
    console.error('📋 Full error:', error);
  }
}

testGmailAuth();
