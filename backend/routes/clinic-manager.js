const express = require('express');
const pool = require('../utils/database');
const { adminSessionMiddleware, managerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Protect all clinic-manager routes with admin session (set by /auth/admin-login) and manager role
router.use(adminSessionMiddleware);
router.use(managerMiddleware);

// Get managed clinics for clinic manager
router.get('/managed-clinics', async (req, res) => {
  try {
    // For now, return all clinics. In a real app, this would be filtered by the clinic manager's assigned clinics
    const query = `
      SELECT id, name, address, phone, email, website, description, status
      FROM clinics
      ORDER BY name
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get managed clinics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Select clinic for clinic manager
router.post('/select-clinic', async (req, res) => {
  try {
    const { clinic_id } = req.body;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Store selected clinic in session
    if (req.session) {
      req.session.selectedClinicId = clinic_id;
    }

    res.json({ success: true, selected_clinic_id: clinic_id });
  } catch (error) {
    console.error('Select clinic error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle clinic status (open/close)
router.post('/clinic/toggle-status', async (req, res) => {
  try {
    console.log('Toggle status request body:', req.body);
    const { clinic_id } = req.body;
    
    if (!clinic_id) {
      console.log('Clinic ID missing in request');
      return res.status(400).json({ error: 'Clinic ID is required' });
    }
    
    console.log('Processing toggle for clinic ID:', clinic_id);

    // Get current status
    const getQuery = `
      SELECT status FROM clinics WHERE id = $1
    `;
    const getResult = await pool.query(getQuery, [clinic_id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const currentStatus = getResult.rows[0].status;
    const newStatus = currentStatus === 'closed' ? 'open' : 'closed';

    // Update status
    const updateQuery = `
      UPDATE clinics
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status
    `;
    const updateResult = await pool.query(updateQuery, [newStatus, clinic_id]);

    res.json({
      success: true,
      status: updateResult.rows[0].status,
      is_open: updateResult.rows[0].status === 'open'
    });
  } catch (error) {
    console.error('Toggle clinic status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard data for clinic manager
router.get('/dashboard', async (req, res) => {
  try {
    const { clinic_id } = req.query;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Get clinic information
    const clinicQuery = `
      SELECT id, name, address, phone, email, website, description, status
      FROM clinics
      WHERE id = $1
    `;
    const clinicResult = await pool.query(clinicQuery, [clinic_id]);
    
    if (clinicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const clinic = clinicResult.rows[0];

    // Get dashboard stats
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM doctors WHERE clinic_id = $1 AND status = 'active') as doctors_count,
        (SELECT COUNT(*) FROM clinic_services WHERE clinic_id = $1) as services_count,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND status = 'pending') as pending_approvals,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND DATE(appointment_date) = $2) as today_appointments,
        (SELECT COUNT(*) FROM appointments WHERE clinic_id = $1 AND DATE(appointment_date) >= $3) as week_appointments
    `;
    const statsResult = await pool.query(statsQuery, [clinic_id, today, weekStart]);
    const stats = statsResult.rows[0];

    // Get recent appointments
    const appointmentsQuery = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
             u.first_name, u.last_name, u.phone
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.clinic_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 5
    `;
    const appointmentsResult = await pool.query(appointmentsQuery, [clinic_id]);

    // Get all clinics for the clinics array
    const allClinicsQuery = `
      SELECT id, name, address, phone, email, website, description, status
      FROM clinics
      ORDER BY name
    `;
    const allClinicsResult = await pool.query(allClinicsQuery);

    res.json({
      selected_clinic: clinic,
      selected_clinic_name: clinic.name,
      clinics: allClinicsResult.rows,
      stats: {
        doctors: parseInt(stats.doctors_count) || 0,
        services: parseInt(stats.services_count) || 0,
        total_appointments: parseInt(stats.total_appointments) || 0,
        pending_approvals: parseInt(stats.pending_approvals) || 0,
        today_appointments: parseInt(stats.today_appointments) || 0,
        week_appointments: parseInt(stats.week_appointments) || 0
      },
      recent_appointments: appointmentsResult.rows,
      settings: {}
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get clinic services
router.get('/clinic/services', async (req, res) => {
  try {
    const { clinic_id } = req.query;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    const query = `
      SELECT s.id, s.name, s.description, s.created_at, s.updated_at
      FROM services s
      LEFT JOIN clinic_services cs ON s.id = cs.service_id
      WHERE cs.clinic_id = $1
      ORDER BY s.name
    `;

    const result = await pool.query(query, [clinic_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get clinic services error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add service to clinic
router.post('/clinic/services', async (req, res) => {
  try {
    const { name, description, clinic_id } = req.body;

    if (!name || !clinic_id) {
      return res.status(400).json({ error: 'Name and clinic ID are required' });
    }

    // First create the service if it doesn't exist
    const serviceQuery = `
      INSERT INTO services (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (name) DO UPDATE SET
        description = EXCLUDED.description,
        updated_at = NOW()
      RETURNING id
    `;

    const serviceResult = await pool.query(serviceQuery, [name, description || '']);
    const serviceId = serviceResult.rows[0].id;

    // Then link it to the clinic
    const linkQuery = `
      INSERT INTO clinic_services (clinic_id, service_id)
      VALUES ($1, $2)
      ON CONFLICT (clinic_id, service_id) DO NOTHING
    `;

    await pool.query(linkQuery, [clinic_id, serviceId]);

    res.json({ success: true, service_id: serviceId });
  } catch (error) {
    console.error('Add clinic service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update service in clinic
router.put('/clinic/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, clinic_id } = req.body;

    if (!name || !clinic_id) {
      return res.status(400).json({ error: 'Name and clinic ID are required' });
    }

    // First update the service in the services table
    const updateServiceQuery = `
      UPDATE services
      SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, name, description
    `;

    const serviceResult = await pool.query(updateServiceQuery, [name, description || '', serviceId]);
    
    if (serviceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Verify the service is linked to this clinic
    const verifyQuery = `
      SELECT 1 FROM clinic_services
      WHERE clinic_id = $1 AND service_id = $2
    `;
    const verifyResult = await pool.query(verifyQuery, [clinic_id, serviceId]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Service not found in this clinic' });
    }

    res.json({
      success: true,
      service: serviceResult.rows[0]
    });
  } catch (error) {
    console.error('Update clinic service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove service from clinic
router.delete('/clinic/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { clinic_id } = req.query;

    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Remove the service from the clinic (not from the services table)
    const query = `
      DELETE FROM clinic_services
      WHERE clinic_id = $1 AND service_id = $2
    `;

    const result = await pool.query(query, [clinic_id, serviceId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Service not found in this clinic' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Remove clinic service error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get clinic appointments
router.get('/appointments', async (req, res) => {
  try {
    const { clinic_id, page = 1, per_page = 20 } = req.query;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(per_page);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM appointments
      WHERE clinic_id = $1
    `;
    const countResult = await pool.query(countQuery, [clinic_id]);
    const total = parseInt(countResult.rows[0].total);

    // Get appointments
    const query = `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status, a.reason,
             u.first_name, u.last_name, u.phone, u.email
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      WHERE a.clinic_id = $1
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [clinic_id, parseInt(per_page), offset]);
    
    res.json({
      appointments: result.rows,
      total: total,
      page: parseInt(page),
      per_page: parseInt(per_page),
      total_pages: Math.ceil(total / parseInt(per_page))
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get clinic doctors
router.get('/clinic/doctors', async (req, res) => {
  try {
    const { clinic_id } = req.query;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    const query = `
      SELECT d.id, u.first_name, u.last_name, d.specialization, d.license_number, 
             d.years_experience, d.consultation_fee, d.status
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE d.clinic_id = $1
      ORDER BY u.last_name, u.first_name
    `;

    const result = await pool.query(query, [clinic_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get clinic doctors error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add doctor to clinic
router.post('/clinic/doctors', async (req, res) => {
  try {
    const { first_name, last_name, specialization, years_experience, consultation_fee, clinic_id } = req.body;

    if (!first_name || !last_name || !specialization || !clinic_id) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Create user first
    const userQuery = `
      INSERT INTO users (first_name, last_name, email, phone, password, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, 'doctor', NOW(), NOW())
      RETURNING id
    `;

    // Generate default email and phone since form doesn't include them
    const defaultEmail = `${first_name.toLowerCase()}.${last_name.toLowerCase()}@clinic.com`;
    const defaultPhone = '(087) 811-0000';
    
    const userResult = await pool.query(userQuery, [
      first_name, last_name, defaultEmail, defaultPhone, '$2b$10$default.password.hash.for.doctors'
    ]);
    const userId = userResult.rows[0].id;

    // Then create doctor record
    const doctorQuery = `
      INSERT INTO doctors (user_id, clinic_id, specialization, license_number, years_experience, consultation_fee, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
      RETURNING id
    `;

    const doctorResult = await pool.query(doctorQuery, [
      userId, clinic_id, specialization, 'LICENSE-' + Date.now(), 
      years_experience || 5, consultation_fee || 800
    ]);

    res.json({ success: true, doctor_id: doctorResult.rows[0].id });
  } catch (error) {
    console.error('Add clinic doctor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update doctor in clinic
router.put('/clinic/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { first_name, last_name, specialization, years_experience, consultation_fee, clinic_id, status } = req.body;
    
    console.log('Update doctor request:', { doctorId, first_name, last_name, specialization, years_experience, consultation_fee, clinic_id, status });

    if (!first_name || !last_name || !specialization) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    // Get the doctor record to find the user_id
    const doctorQuery = `
      SELECT user_id FROM doctors WHERE id = $1
    `;
    const doctorResult = await pool.query(doctorQuery, [doctorId]);
    
    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const userId = doctorResult.rows[0].user_id;

    // Update the user record
    const userUpdateQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = NOW()
      WHERE id = $3
    `;
    await pool.query(userUpdateQuery, [first_name, last_name, userId]);

    // Update the doctor record
    const doctorUpdateQuery = `
      UPDATE doctors 
      SET specialization = $1, years_experience = $2, consultation_fee = $3, status = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, specialization, years_experience, consultation_fee, status
    `;
    
    // First, let's check the current status before updating
    const currentStatusQuery = 'SELECT status FROM doctors WHERE id = $1';
    const currentStatusResult = await pool.query(currentStatusQuery, [doctorId]);
    console.log('Current doctor status before update:', currentStatusResult.rows[0]?.status);
    console.log('Executing update query with params:', [
      specialization, 
      years_experience || 5, 
      consultation_fee || 800,
      status || 'active', 
      doctorId
    ]);
    
    let updateResult;
    try {
      updateResult = await pool.query(doctorUpdateQuery, [
        specialization, 
        years_experience || 5, 
        consultation_fee || 800,
        status || 'active', 
        doctorId
      ]);

      console.log('Doctor update result:', updateResult.rows[0]);
      
      // Check the status after update to confirm it was actually saved
      const afterUpdateQuery = 'SELECT status FROM doctors WHERE id = $1';
      const afterUpdateResult = await pool.query(afterUpdateQuery, [doctorId]);
      console.log('Doctor status after update:', afterUpdateResult.rows[0]?.status);
      
    } catch (queryError) {
      console.error('SQL Query Error:', queryError);
      console.error('Query that failed:', doctorUpdateQuery);
      throw queryError;
    }

    res.json({
      success: true,
      doctor: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update clinic doctor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove doctor from clinic
router.delete('/clinic/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Delete the doctor record (this will not delete the user, just the doctor association)
    const query = `
      DELETE FROM doctors
      WHERE id = $1
    `;

    const result = await pool.query(query, [doctorId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Remove clinic doctor error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard data for clinic manager
router.get('/dashboard', async (req, res) => {
  try {
    const { clinic_id } = req.query;
    
    if (!clinic_id) {
      return res.status(400).json({ error: 'Clinic ID is required' });
    }

    // Get selected clinic info
    const clinicQuery = 'SELECT * FROM clinics WHERE id = $1';
    const clinicResult = await pool.query(clinicQuery, [clinic_id]);
    
    if (clinicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Get basic stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT a.id) as total_appointments,
        COUNT(DISTINCT d.id) as total_doctors,
        COUNT(DISTINCT s.id) as total_services
      FROM clinics c
      LEFT JOIN appointments a ON c.id = a.clinic_id
      LEFT JOIN clinic_doctors cd ON c.id = cd.clinic_id
      LEFT JOIN doctors d ON cd.doctor_id = d.id
      LEFT JOIN clinic_services cs ON c.id = cs.clinic_id
      LEFT JOIN services s ON cs.service_id = s.id
      WHERE c.id = $1
    `;
    const statsResult = await pool.query(statsQuery, [clinic_id]);

    const stats = statsResult.rows[0];

    res.json({
      selected_clinic: clinicResult.rows[0],
      stats: {
        total_appointments: parseInt(stats.total_appointments) || 0,
        total_doctors: parseInt(stats.total_doctors) || 0,
        total_services: parseInt(stats.total_services) || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update doctor status specifically
router.put('/clinic/doctors/:doctorId/status', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;
    
    console.log('Direct status update request:', { doctorId, status });

    if (!status || (status !== 'active' && status !== 'inactive')) {
      return res.status(400).json({ error: 'Invalid status. Must be active or inactive' });
    }

    // Check current status
    const currentStatusQuery = 'SELECT status FROM doctors WHERE id = $1';
    const currentStatusResult = await pool.query(currentStatusQuery, [doctorId]);
    console.log('Current status before update:', currentStatusResult.rows[0]?.status);

    // Update only the status
    const updateStatusQuery = `
      UPDATE doctors 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, status
    `;
    
    const updateResult = await pool.query(updateStatusQuery, [status, doctorId]);
    console.log('Status update result:', updateResult.rows[0]);

    res.json({
      success: true,
      doctor: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Update doctor status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
