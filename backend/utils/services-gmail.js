const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { generatePDF } = require('./services-free');

// Gmail Email Service with OAuth 2.0
class GmailEmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // For development, use simple SMTP with app password
      // For production, this will use OAuth 2.0
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER || process.env.GMAIL_SENDER_EMAIL,
          pass: process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD
        }
      });
      
      console.log('✅ Gmail email service initialized');
    } catch (error) {
      console.error('❌ Gmail service initialization failed:', error.message);
    }
  }

  async sendEmail({ to, subject, template, data, includePDF = true }) {
    try {
      console.log('🔍 Starting Gmail email send process...');
      console.log('📧 Email details:', { to, subject, template, includePDF });
      
      if (!this.transporter) {
        throw new Error('Gmail transporter not initialized');
      }

      // Generate HTML content based on template
      let htmlContent = '';
      switch (template) {
        case 'appointment-confirmation':
          htmlContent = this.generateAppointmentConfirmationHTML(data);
          break;
        case 'appointment-reminder':
          htmlContent = this.generateAppointmentReminderHTML(data);
          break;
        default:
          htmlContent = `
            <h1>ClinicBook</h1>
            <p>${JSON.stringify(data)}</p>
          `;
      }

      // Prepare email options
      const mailOptions = {
        from: `ClinicBook <${process.env.GMAIL_SENDER_EMAIL || 'arizarhenz322@gmail.com'}>`,
        to: to, // Send to actual recipient
        subject: subject,
        html: htmlContent,
      };

      console.log('📨 Email options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        hasHTML: !!htmlContent,
        includePDF
      });

      // Add PDF attachment if requested
      if (includePDF && data.appointment) {
        console.log('📎 Generating PDF attachment...');
        const pdfBuffer = await generatePDF(data);
        mailOptions.attachments = [
          {
            filename: `appointment-receipt-${data.appointment.id}.pdf`,
            content: pdfBuffer,
          },
        ];
        console.log('✅ PDF attachment generated successfully');
      }

      console.log('📤 Sending email via Gmail API...');
      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully via Gmail to ${to}`);
      console.log('📧 Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Gmail email send error:', error.message);
      console.error('❌ Full error details:', error);
      throw error;
    }
  }

  // Generate HTML for appointment confirmation (same as services-free.js)
  generateAppointmentConfirmationHTML(data) {
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
  }

  // Generate HTML for appointment reminder
  generateAppointmentReminderHTML(data) {
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
  }
}

// Create singleton instance
const gmailEmailService = new GmailEmailService();

module.exports = gmailEmailService;
