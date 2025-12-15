const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send appointment confirmation email using Resend API
 * @param {string} patientEmail - Email address from booking form (recipient)
 * @param {object} appointmentData - Appointment details from database
 * @param {object} clinicInfo - Clinic information
 * @param {object} patientInfo - Patient information from form
 * @returns {Promise<object>} - Resend API response
 */
const sendAppointmentConfirmationEmail = async (
  patientEmail,
  appointmentData,
  clinicInfo,
  patientInfo = {}
) => {
  try {
    // Validate email
    if (!patientEmail || !patientEmail.includes('@')) {
      throw new Error(`Invalid patient email: ${patientEmail}`);
    }

    // Validate required data
    if (!appointmentData || !clinicInfo) {
      throw new Error('Missing appointment or clinic data');
    }

    // Format appointment date and time
    const appointmentDate = new Date(appointmentData.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const confirmationNumber = `APT-${appointmentData.id}-${Date.now().toString().slice(-4)}`;

    // Build email HTML content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0066cc;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0066cc;
              margin: 0;
              font-size: 28px;
            }
            .confirmation-number {
              background-color: #e8f4f8;
              padding: 15px;
              border-left: 4px solid #0066cc;
              margin: 20px 0;
              font-family: monospace;
              font-weight: bold;
              color: #0066cc;
            }
            .section {
              margin: 25px 0;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
            .section h2 {
              color: #0066cc;
              font-size: 18px;
              margin-top: 0;
              border-bottom: 2px solid #0066cc;
              padding-bottom: 10px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: bold;
              color: #555;
              min-width: 150px;
            }
            .detail-value {
              color: #333;
              text-align: right;
            }
            .important {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .important h3 {
              margin-top: 0;
              color: #856404;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 12px;
            }
            .button {
              display: inline-block;
              background-color: #0066cc;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              text-align: center;
            }
            .status-badge {
              display: inline-block;
              background-color: #28a745;
              color: white;
              padding: 5px 10px;
              border-radius: 3px;
              font-size: 12px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Appointment Confirmed</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your booking has been successfully confirmed</p>
            </div>

            <div class="confirmation-number">
              Confirmation Number: ${confirmationNumber}
            </div>

            <div class="section">
              <h2>Patient Information</h2>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${appointmentData.first_name} ${appointmentData.last_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${patientEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${appointmentData.phone || 'Not provided'}</span>
              </div>
            </div>

            <div class="section">
              <h2>Appointment Details</h2>
              <div class="detail-row">
                <span class="detail-label">Clinic:</span>
                <span class="detail-value">${clinicInfo.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value">${clinicInfo.address}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${appointmentData.appointment_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${appointmentData.service || 'General Consultation'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="status-badge">CONFIRMED</span></span>
              </div>
            </div>

            ${appointmentData.reason ? `
            <div class="section">
              <h2>Reason for Visit</h2>
              <p>${appointmentData.reason}</p>
            </div>
            ` : ''}

            <div class="important">
              <h3>📋 Important Information</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Please arrive 10-15 minutes early for check-in</li>
                <li>Bring a valid ID and insurance card if applicable</li>
                <li>If you need to reschedule, contact the clinic at least 24 hours in advance</li>
                <li>For emergencies, call the clinic directly at ${clinicInfo.phone || 'N/A'}</li>
              </ul>
            </div>

            <div class="section">
              <h2>Contact Information</h2>
              <div class="detail-row">
                <span class="detail-label">Clinic Phone:</span>
                <span class="detail-value">${clinicInfo.phone || 'Not available'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Clinic Email:</span>
                <span class="detail-value">${clinicInfo.email || 'Not available'}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/appointments" class="button">View Your Appointments</a>
            </div>

            <div class="footer">
              <p>This is an automated confirmation email. Please do not reply to this email.</p>
              <p>If you did not make this appointment, please contact us immediately.</p>
              <p>&copy; ${new Date().getFullYear()} ClinicFinder. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Build plain text version
    const emailText = `
APPOINTMENT CONFIRMATION

Confirmation Number: ${confirmationNumber}

PATIENT INFORMATION
Name: ${appointmentData.first_name} ${appointmentData.last_name}
Email: ${patientEmail}
Phone: ${appointmentData.phone || 'Not provided'}

APPOINTMENT DETAILS
Clinic: ${clinicInfo.name}
Address: ${clinicInfo.address}
Date: ${formattedDate}
Time: ${appointmentData.appointment_time}
Service: ${appointmentData.service || 'General Consultation'}
Status: CONFIRMED

${appointmentData.reason ? `REASON FOR VISIT\n${appointmentData.reason}\n` : ''}

IMPORTANT INFORMATION
- Please arrive 10-15 minutes early for check-in
- Bring a valid ID and insurance card if applicable
- If you need to reschedule, contact the clinic at least 24 hours in advance
- For emergencies, call the clinic directly at ${clinicInfo.phone || 'N/A'}

CONTACT INFORMATION
Clinic Phone: ${clinicInfo.phone || 'Not available'}
Clinic Email: ${clinicInfo.email || 'Not available'}

This is an automated confirmation email. Please do not reply to this email.
If you did not make this appointment, please contact us immediately.

© ${new Date().getFullYear()} ClinicFinder. All rights reserved.
    `.trim();

    // Send email via Resend
    console.log('🔍 Resend API Configuration:');
    console.log(`   API Key: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`   From Email: ${process.env.RESEND_FROM_EMAIL}`);
    console.log(`   To Email: ${patientEmail}`);
    
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: patientEmail,
      subject: `Appointment Confirmation - ${clinicInfo.name} on ${formattedDate}`,
      html: emailHTML,
      text: emailText,
      replyTo: clinicInfo.email || process.env.GMAIL_SENDER_EMAIL,
      tags: [
        { name: 'category', value: 'appointment_confirmation' },
        { name: 'appointment_id', value: appointmentData.id.toString() }
      ]
    });

    console.log('📤 Resend API Response:');
    console.log(`   Full Response: ${JSON.stringify(response)}`);
    console.log(`   Message ID: ${response.id}`);
    console.log(`   Error (if any): ${response.error}`);

    console.log(`✅ Appointment confirmation email sent successfully to ${patientEmail}`);
    console.log(`   Confirmation Number: ${confirmationNumber}`);
    console.log(`   Resend Message ID: ${response.id}`);

    return {
      success: true,
      messageId: response.id,
      recipient: patientEmail,
      confirmationNumber: confirmationNumber,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`❌ Failed to send appointment confirmation email to ${patientEmail}:`, error.message);
    
    // Log detailed error for debugging
    console.error('Error details:', {
      patientEmail,
      appointmentId: appointmentData?.id,
      clinicId: clinicInfo?.id,
      errorMessage: error.message,
      errorStack: error.stack
    });

    // Return error response but don't throw - allow appointment to be created
    return {
      success: false,
      error: error.message,
      recipient: patientEmail,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Send appointment cancellation email
 * @param {string} patientEmail - Patient's email address
 * @param {object} appointmentData - Appointment details
 * @param {object} clinicInfo - Clinic information
 * @returns {Promise<object>} - Resend API response
 */
const sendAppointmentCancellationEmail = async (
  patientEmail,
  appointmentData,
  clinicInfo
) => {
  try {
    if (!patientEmail || !patientEmail.includes('@')) {
      throw new Error(`Invalid patient email: ${patientEmail}`);
    }

    const appointmentDate = new Date(appointmentData.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 3px solid #dc3545; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #dc3545; margin: 0; }
            .section { margin: 25px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px; }
            .section h2 { color: #dc3545; font-size: 18px; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="section">
              <h2>Cancellation Details</h2>
              <p><strong>Clinic:</strong> ${clinicInfo.name}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${appointmentData.appointment_time}</p>
              <p>Your appointment has been cancelled. If you have any questions, please contact the clinic.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: patientEmail,
      subject: `Appointment Cancelled - ${clinicInfo.name}`,
      html: emailHTML,
      replyTo: clinicInfo.email || process.env.GMAIL_SENDER_EMAIL,
      tags: [
        { name: 'category', value: 'appointment_cancellation' },
        { name: 'appointment_id', value: appointmentData.id.toString() }
      ]
    });

    console.log(`✅ Appointment cancellation email sent to ${patientEmail}`);
    return { success: true, messageId: response.id };

  } catch (error) {
    console.error(`❌ Failed to send cancellation email to ${patientEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail
};
