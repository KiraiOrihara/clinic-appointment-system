const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

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
      doc.text(`${data.patient.firstName} ${data.patient.lastName}`);
      doc.text(`Email: ${data.patient.email}`);
      doc.text(`Phone: ${data.patient.phone}`);
      doc.moveDown();

      // QR Code placeholder (in production, you'd generate actual QR code)
      doc.fontSize(10).text('QR Code for Check-in:', { align: 'center' });
      doc.rect(200, 450, 100, 100).stroke();
      doc.fontSize(8).text('Scan at clinic', 225, 500, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Upload file to S3
const uploadToS3 = async (key, buffer) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    });

    await s3Client.send(command);

    // Generate signed URL (valid for 7 days)
    const getObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 7 * 24 * 60 * 60, // 7 days
    });

    return signedUrl;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Send email using SendGrid
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    // Create transporter (using SendGrid SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

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

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
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
          <h2>Important Information</h2>
          <ul>
            <li>Please arrive 15 minutes before your scheduled appointment time</li>
            <li>Bring your ID and insurance card if applicable</li>
            <li>Use the QR code in your PDF receipt for quick check-in</li>
            <li>If you need to cancel, please do so at least 24 hours in advance</li>
          </ul>
        </div>

        <div class="section" style="text-align: center;">
          <a href="${data.receiptUrl}" class="btn">Download Receipt</a>
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
  uploadToS3,
  sendEmail,
};
