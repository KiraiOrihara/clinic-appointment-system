const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// RESEND EMAIL SERVICE MODULE
// Primary email service - Gmail SMTP removed

// Initialize Resend client (required for email functionality)
let resendClient = null;
if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
  try {
    const resend = require('resend');
    resendClient = new resend.Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend email service initialized as primary service');
  } catch (error) {
    console.error('❌ Resend package not found or API key invalid:', error.message);
    console.error('❌ Email service unavailable - please install Resend and configure API key');
  }
} else {
  console.error('❌ RESEND_API_KEY not configured - email service unavailable');
}

// Generate PDF receipt
const generatePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      // PDF Content
      doc.fontSize(20).text('Appointment Confirmation', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text('Appointment Details:', { underline: true });
      doc.fontSize(12);
      doc.text(`Confirmation #: APT-${data.appointment.id}`);
      doc.text(`Date: ${new Date(data.appointment.appointment_date).toLocaleDateString()}`);
      doc.text(`Time: ${data.appointment.appointment_time}`);
      doc.text(`Service: ${data.appointment.service}`);
      doc.moveDown();

      doc.fontSize(14).text('Clinic Information:', { underline: true });
      doc.fontSize(12);
      doc.text(data.clinic.name);
      doc.text(data.clinic.address);
      doc.text(`Phone: ${data.clinic.phone}`);
      doc.moveDown();

      doc.fontSize(14).text('Patient Information:', { underline: true });
      doc.fontSize(12);
      doc.text(`${data.appointment.first_name} ${data.appointment.last_name}`);
      doc.text(`Email: ${data.appointment.email}`);
      doc.text(`Phone: ${data.appointment.phone}`);
      doc.moveDown();

      // QR Code placeholder
      doc.fontSize(10).text('QR Code for Check-in:', { align: 'center' });
      doc.rect(200, 450, 100, 100).stroke();
      doc.fontSize(8).text('Scan at clinic', 225, 500, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Save PDF locally (free alternative to S3)
const savePDFLocally = async (filename, buffer) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Return a local URL (in production, you'd serve these files statically)
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Local PDF save error:', error);
    throw new Error('Failed to save PDF locally');
  }
};

// RESEND EMAIL FUNCTION (Primary Service)
const sendEmailWithResend = async ({ to, subject, template, data, includePDF = true }) => {
  try {
    console.log('🔍 Starting email send process...');
    console.log('📧 Email details:', { to, subject, template, includePDF });
    
    if (!resendClient) {
      throw new Error('Resend client not initialized - check API key configuration');
    }

    // Generate HTML content based on template
    let htmlContent = '';
    switch (template) {
      case 'appointment-confirmation':
        htmlContent = generateAppointmentConfirmationHTML(data);
        break;
      case 'appointment-reminder':
        htmlContent = generateAppointmentReminderHTML(data);
        break;
      default:
        htmlContent = `
          <h1>ClinicBook</h1>
          <p>${JSON.stringify(data)}</p>
        `;
    }

    // Prepare email options
    const emailOptions = {
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [to],
      subject: subject,
      html: htmlContent,
    };

    console.log('📨 Email options prepared:', {
      from: emailOptions.from,
      to: emailOptions.to,
      subject: emailOptions.subject,
      hasHTML: !!htmlContent,
      includePDF
    });

    // Add PDF attachment if requested
    if (includePDF && data.appointment) {
      console.log('📎 Generating PDF attachment...');
      const pdfBuffer = await generatePDF(data);
      emailOptions.attachments = [
        {
          filename: `appointment-receipt-${data.appointment.id}.pdf`,
          content: pdfBuffer,
        },
      ];
      console.log('✅ PDF attachment generated successfully');
    }

    console.log('📤 Sending email via Resend API...');
    const { data: responseData, error } = await resendClient.emails.send(emailOptions);

    if (error) {
      console.error('❌ Resend API error:', error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully via Resend to ${to}`);
    console.log('📧 Email ID:', responseData);
    return responseData;
  } catch (error) {
    console.error('❌ Resend email send error:', error.message);
    console.error('❌ Full error details:', error);
    throw error;
  }
};

// Primary email sending function (Resend only)
const sendEmail = async ({ to, subject, template, data, includePDF = true }) => {
  console.log(`📧 Sending email to: ${to} (${process.env.NODE_ENV})`);
  
  // Send to actual recipient - no more hardcoded routing
  return await sendEmailWithResend({ 
    to: to, // Send to actual patient email
    subject, 
    template, 
    data, 
    includePDF 
  });
};

// Generate HTML for appointment confirmation
const generateAppointmentConfirmationHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #3b82f6; margin: 0; }
        .section { margin-bottom: 25px; }
        .section h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .details p { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Confirmation</h1>
          <p>Your appointment has been successfully booked!</p>
        </div>

        <div class="section">
          <h2>Appointment Details</h2>
          <div class="details">
            <p><strong>Confirmation #:</strong> APT-${data.appointment.id}</p>
            <p><strong>Date:</strong> ${new Date(data.appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.appointment.appointment_time}</p>
            <p><strong>Service:</strong> ${data.appointment.service}</p>
          </div>
        </div>

        <div class="section">
          <h2>Clinic Information</h2>
          <div class="details">
            <p><strong>${data.clinic.name}</strong></p>
            <p>${data.clinic.address}</p>
            <p><strong>Phone:</strong> ${data.clinic.phone}</p>
          </div>
        </div>

        <div class="section">
          <h2>Patient Information</h2>
          <div class="details">
            <p><strong>Name:</strong> ${data.appointment.first_name} ${data.appointment.last_name}</p>
            <p><strong>Email:</strong> ${data.appointment.email}</p>
            <p><strong>Phone:</strong> ${data.appointment.phone}</p>
          </div>
        </div>

        <div class="section">
          <h2>Important Information</h2>
          <ul>
            <li>Please arrive 15 minutes before your scheduled appointment time</li>
            <li>Bring your ID and insurance card if applicable</li>
            <li>If you need to cancel, please do so at least 24 hours in advance</li>
          </ul>
        </div>

        <div class="footer">
          <p>This is an automated message from ClinicBook. Please do not reply to this email.</p>
          <p>For support, contact us at support@clinicbook.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate HTML for appointment reminder
const generateAppointmentReminderHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Appointment Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #3b82f6; margin: 0; }
        .reminder { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 25px; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .details p { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
          <p>Your appointment is coming up soon!</p>
        </div>

        <div class="reminder">
          <strong>Reminder:</strong> You have an appointment scheduled for tomorrow.
        </div>

        <div class="section">
          <h2>Appointment Details</h2>
          <div class="details">
            <p><strong>Date:</strong> ${new Date(data.appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Time:</strong> ${data.appointment.appointment_time}</p>
            <p><strong>Clinic:</strong> ${data.clinic.name}</p>
            <p><strong>Address:</strong> ${data.clinic.address}</p>
          </div>
        </div>

        <div class="section">
          <h2>What to Bring</h2>
          <ul>
            <li>Valid photo ID</li>
            <li>Insurance card (if applicable)</li>
            <li>List of current medications</li>
            <li>Any relevant medical records</li>
          </ul>
        </div>

        <div class="footer">
          <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
          <p>ClinicBook - Making healthcare accessible</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generatePDF,
  savePDFLocally,
  sendEmail,
};
