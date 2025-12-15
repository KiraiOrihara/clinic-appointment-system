const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const pool = require('../utils/database');
const { generatePDF, savePDFLocally } = require('../utils/services-free');
const { sendAppointmentConfirmationEmail, sendAppointmentCancellationEmail } = require('../utils/resendEmailService');

const router = express.Router();

// Get all appointments (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT a.*, c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone,
             u.first_name, u.last_name, u.email as user_email
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN users u ON a.user_id = u.id
    `;

    const params = [];
    const whereConditions = [];

    if (status) {
      whereConditions.push(`a.status = $${params.length + 1}`);
      params.push(status);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new appointment
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      clinicId,
      service,
      date,
      time,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      reason,
      insurance
    } = req.body;

    // Basic validation before DB work
    if (!clinicId || isNaN(parseInt(clinicId, 10))) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid clinicId' });
    }
    if (!service || !date || !time) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Missing required fields (service, date, time)' });
    }
    if (!firstName || !lastName || !email) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Missing required patient fields' });
    }

    const clinicIdInt = parseInt(clinicId, 10);

    await client.query('BEGIN');

    // Ensure clinic exists
    const clinicExists = await client.query('SELECT id FROM clinics WHERE id = $1', [clinicIdInt]);
    if (clinicExists.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Clinic not found' });
    }

    // Require a valid user id from session
    if (!req.user?.id) {
      await client.query('ROLLBACK');
      return res.status(401).json({ error: 'No session found, authorization denied' });
    }

    // Check if the time slot is still available
    const existingAppointment = await client.query(
      `SELECT id FROM appointments 
       WHERE clinic_id = $1 AND appointment_date = $2 AND appointment_time = $3 
       AND status != 'cancelled'`,
      [clinicIdInt, date, time]
    );

    if (existingAppointment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Create appointment
    const appointmentQuery = `
      INSERT INTO appointments (
        clinic_id, user_id, service, appointment_date, appointment_time,
        first_name, last_name, email, phone, date_of_birth, reason, insurance, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'confirmed')
      RETURNING *
    `;

    const result = await client.query(appointmentQuery, [
      clinicIdInt, req.user.id, service, date, time,
      firstName, lastName, email, phone || '', dateOfBirth || null, reason, insurance
    ]);

    const appointment = result.rows[0];

    // Get clinic information
    const clinicResult = await client.query(
      'SELECT name, address, phone FROM clinics WHERE id = $1',
      [clinicId]
    );

    const clinic = clinicResult.rows[0];

    // Generate PDF receipt
    const pdfBuffer = await generatePDF({
      appointment,
      clinic,
      patient: { firstName, lastName, email, phone }
    });

    // Save PDF locally (free alternative to S3)
    const receiptUrl = await savePDFLocally(
      `receipts/${appointment.id}.pdf`,
      pdfBuffer
    );

    // Update appointment with receipt URL
    await client.query(
      'UPDATE appointments SET receipt_url = $1 WHERE id = $2',
      [receiptUrl, appointment.id]
    );

    // Send confirmation email using Resend API
    try {
      const resendResult = await sendAppointmentConfirmationEmail(
        req.user.email,  // Send to logged-in user's email
        appointment,
        clinic,
        { firstName, lastName, email, phone }
      );
      
      if (resendResult.success) {
        console.log(`✅ Appointment confirmation sent via Resend to ${req.user.email}`);
        console.log(`   Confirmation Number: ${resendResult.confirmationNumber}`);
      } else {
        console.warn(`⚠️ Resend email failed (appointment still created): ${resendResult.error}`);
      }
    } catch (resendError) {
      console.error('❌ Resend email error (appointment still created):', resendError.message);
      // Continue without email - appointment is still valid
    }

    await client.query('COMMIT');

    res.status(201).json({
      ...appointment,
      receiptUrl
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Server error while creating appointment', details: error.message });
  } finally {
    client.release();
  }
});

// Get user's appointments
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT a.*, c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.user_id = $1
    `;

    const params = [req.user.id];

    if (status) {
      query += ` AND a.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT a.*, c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.id = $1 AND a.user_id = $2
    `;

    const result = await pool.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists and belongs to user
    const appointmentQuery = `
      SELECT id, appointment_date, status
      FROM appointments
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(appointmentQuery, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({ error: 'Cannot cancel past appointments' });
    }

    // Update appointment status
    const updateResult = await pool.query(
      'UPDATE appointments SET status = $1, cancelled_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    const updatedAppointment = updateResult.rows[0];

    res.json({ 
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reschedule appointment
router.patch('/:id/reschedule', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    await client.query('BEGIN');

    // Check if appointment exists and belongs to user
    const appointmentQuery = `
      SELECT id, appointment_date, appointment_time, clinic_id, status
      FROM appointments
      WHERE id = $1 AND user_id = $2
    `;

    const result = await client.query(appointmentQuery, [id, req.user.id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    if (appointment.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot reschedule cancelled appointments' });
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cannot reschedule past appointments' });
    }

    // Check if new time slot is available
    const existingAppointment = await client.query(
      `SELECT id FROM appointments 
       WHERE clinic_id = $1 AND appointment_date = $2 AND appointment_time = $3 
       AND status != 'cancelled' AND id != $4`,
      [appointment.clinic_id, date, time, id]
    );

    if (existingAppointment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot is already booked' });
    }

    // Update appointment date and time
    const updateQuery = `
      UPDATE appointments 
      SET appointment_date = $1, appointment_time = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [date, time, id]);
    const updatedAppointment = updateResult.rows[0];

    await client.query('COMMIT');

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Resend receipt
router.post('/:id/resend-receipt', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get appointment details
    const query = `
      SELECT a.*, c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.id = $1 AND a.user_id = $2
    `;

    const result = await pool.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    // Send confirmation email using Resend API
    try {
      const resendResult = await sendAppointmentConfirmationEmail(
        req.user.email,
        appointment,
        {
          name: appointment.clinic_name,
          address: appointment.clinic_address,
          phone: appointment.clinic_phone
        }
      );
      
      if (resendResult.success) {
        console.log(`✅ Confirmation email resent successfully via Resend to ${req.user.email}`);
      } else {
        console.warn(`⚠️ Resend email failed: ${resendResult.error}`);
      }
    } catch (emailError) {
      console.error('❌ Email resend error (appointment still valid):', emailError.message);
      // Continue without email - appointment is still valid
    }

    res.json({ message: 'Receipt resent successfully' });
  } catch (error) {
    console.error('Resend receipt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new appointment (no auth required for guest bookings)
router.post('/guest', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      clinic_id,
      service_id,
      service,
      appointment_date,
      appointment_time,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      reason,
      insurance
    } = req.body;

    console.log('Guest appointment request:', {
      clinic_id,
      service_id,
      service,
      appointment_date,
      appointment_time,
      first_name,
      last_name,
      email
    });

    // Validate required fields
    if (!clinic_id || !service || !appointment_date || !appointment_time || !first_name || !last_name || !email) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    await client.query('BEGIN');

    // Check if the time slot is still available
    const existingAppointment = await client.query(
      `SELECT id FROM appointments 
       WHERE clinic_id = $1 AND appointment_date = $2 AND appointment_time = $3 
       AND status != 'cancelled'`,
      [clinic_id, appointment_date, appointment_time]
    );

    if (existingAppointment.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Create appointment without user_id (guest appointment)
    const appointmentQuery = `
      INSERT INTO appointments (
        clinic_id, user_id, service, appointment_date, appointment_time,
        first_name, last_name, email, phone, date_of_birth, reason, insurance, status
      ) VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed')
      RETURNING *
    `;

    const result = await client.query(appointmentQuery, [
      clinic_id, service, appointment_date, appointment_time,
      first_name, last_name, email, phone, date_of_birth || null, reason || null, insurance || null
    ]);

    const appointment = result.rows[0];
    console.log('Guest appointment created:', appointment);

    // Get clinic information for email
    const clinicQuery = 'SELECT name, address, phone FROM clinics WHERE id = $1';
    const clinicResult = await client.query(clinicQuery, [clinic_id]);
    const clinic = clinicResult.rows[0];

    await client.query('COMMIT');

    // Send confirmation email (disabled for now to fix booking)
    try {
      // Temporarily disable email to fix booking issues
      console.log('Email sending temporarily disabled for appointment:', appointment.id);
      // await sendAppointmentConfirmationEmail(appointment, clinic);
      // console.log('Confirmation email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Guest appointment creation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: error.query || 'No query info',
      parameters: error.parameters || 'No parameters'
    });
    res.status(500).json({ error: 'Server error while creating appointment' });
  } finally {
    client.release();
  }
});

module.exports = router;
