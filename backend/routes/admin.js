const express = require('express');
const { adminSessionMiddleware, adminMiddleware } = require('../middleware/auth');
const pool = require('../utils/database');

const router = express.Router();

// Apply admin session middleware for proper protection
router.use(adminSessionMiddleware);
router.use(adminMiddleware);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // Total clinics
    const clinicsResult = await pool.query('SELECT COUNT(*) as count FROM clinics');
    stats.totalClinics = parseInt(clinicsResult.rows[0].count);

    // Total appointments
    const appointmentsResult = await pool.query('SELECT COUNT(*) as count FROM appointments');
    stats.totalAppointments = parseInt(appointmentsResult.rows[0].count);

    // Pending appointments
    const pendingResult = await pool.query(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'confirmed'"
    );
    stats.pendingAppointments = parseInt(pendingResult.rows[0].count);

    // Total users
    const usersResult = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    stats.totalUsers = parseInt(usersResult.rows[0].count);

    // Recent appointments
    const recentResult = await pool.query(`
      SELECT a.*, c.name as clinic_name, u.first_name, u.last_name
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `);
    stats.recentAppointments = recentResult.rows;

    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all appointments with filters (admin view)
router.get('/appointments', async (req, res) => {
  try {
    const { status, clinicId, startDate, endDate } = req.query;

    let query = `
      SELECT a.*, c.name as clinic_name, u.first_name, u.last_name, u.email
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    const conditions = [];

    if (status) {
      conditions.push(`a.status = $${params.length + 1}`);
      params.push(status);
    }

    if (clinicId) {
      conditions.push(`a.clinic_id = $${params.length + 1}`);
      params.push(clinicId);
    }

    if (startDate) {
      conditions.push(`a.appointment_date >= $${params.length + 1}`);
      params.push(startDate);
    }

    if (endDate) {
      conditions.push(`a.appointment_date <= $${params.length + 1}`);
      params.push(endDate);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    // Check if appointment exists
    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments WHERE id = $1',
      [appointmentId]
    );
    
    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Delete the appointment
    await pool.query('DELETE FROM appointments WHERE id = $1', [appointmentId]);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all clinics (admin view)
router.get('/clinics', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(a.id) as total_appointments
      FROM clinics c
      LEFT JOIN reviews r ON c.id = r.clinic_id
      LEFT JOIN appointments a ON c.id = a.clinic_id
      GROUP BY c.id
      ORDER BY c.name
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin clinics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new clinic
router.post('/clinics', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      name,
      address,
      phone,
      email,
      website,
      description,
      latitude,
      longitude,
      services,
      availability
    } = req.body;

    await client.query('BEGIN');

    // Create clinic
    const clinicQuery = `
      INSERT INTO clinics (name, address, phone, email, website, description, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const clinicResult = await client.query(clinicQuery, [
      name, address, phone, email, website, description, latitude, longitude
    ]);

    const clinic = clinicResult.rows[0];

    // Add services
    if (services && services.length > 0) {
      for (const service of services) {
        // Check if service exists
        const serviceResult = await client.query(
          'SELECT id FROM services WHERE LOWER(name) = LOWER($1)',
          [service]
        );

        let serviceId;
        if (serviceResult.rows.length === 0) {
          // Create new service
          const newServiceResult = await client.query(
            'INSERT INTO services (name) VALUES ($1) RETURNING id',
            [service]
          );
          serviceId = newServiceResult.rows[0].id;
        } else {
          serviceId = serviceResult.rows[0].id;
        }

        // Link service to clinic
        await client.query(
          'INSERT INTO clinic_services (clinic_id, service_id) VALUES ($1, $2)',
          [clinic.id, serviceId]
        );
      }
    }

    // Add availability
    if (availability && availability.length > 0) {
      for (const avail of availability) {
        await client.query(
          'INSERT INTO clinic_availability (clinic_id, day_of_week, opening_time, closing_time) VALUES ($1, $2, $3, $4)',
          [clinic.id, avail.dayOfWeek, avail.openingTime, avail.closingTime]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json(clinic);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create clinic error:', error);
    res.status(500).json({ error: 'Server error while creating clinic' });
  } finally {
    client.release();
  }
});

// Update clinic
router.put('/clinics/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      name,
      address,
      phone,
      email,
      website,
      description,
      latitude,
      longitude,
      status
    } = req.body;

    await client.query('BEGIN');

    // Update clinic
    const clinicQuery = `
      UPDATE clinics 
      SET name = $1, address = $2, phone = $3, email = $4, website = $5, 
          description = $6, latitude = $7, longitude = $8, status = $9,
          updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const result = await client.query(clinicQuery, [
      name, address, phone, email, website, description, 
      latitude, longitude, status, id
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Clinic not found' });
    }

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update clinic error:', error);
    res.status(500).json({ error: 'Server error while updating clinic' });
  } finally {
    client.release();
  }
});

// Delete clinic
router.delete('/clinics/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Check if clinic has any appointments
    const appointmentsResult = await client.query(
      'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = $1',
      [id]
    );

    if (parseInt(appointmentsResult.rows[0].count) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Cannot delete clinic with existing appointments' 
      });
    }

    // Delete clinic (cascade will handle related records)
    await client.query('DELETE FROM clinics WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete clinic error:', error);
    res.status(500).json({ error: 'Server error while deleting clinic' });
  } finally {
    client.release();
  }
});

// Cancel appointment (admin)
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Update appointment status
    await pool.query(
      'UPDATE appointments SET status = $1, cancelled_at = NOW(), cancellation_reason = $2, updated_at = NOW() WHERE id = $3',
      ['cancelled', reason, id]
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Admin cancel appointment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin view)
router.get('/users', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        CASE 
          WHEN created_at IS NOT NULL THEN 'active'
          ELSE 'inactive'
        END as status
      FROM users 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    const users = result.rows.map(user => ({
      ...user,
      name: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name || 'Unknown',
      joined: user.created_at?.toISOString()?.split('T')[0] || null
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // Check if user exists and fetch role
    const userCheck = await client.query(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { role } = userCheck.rows[0];
    
    // Clinic managers should not be deleted; mark as inactive instead
    if (role === 'clinic_manager') {
      const updated = await client.query(`
        UPDATE users
        SET role = 'clinic_manager_inactive', updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, first_name, last_name, role
      `, [id]);

      return res.json({
        message: 'Clinic manager deactivated instead of deleted',
        manager: updated.rows[0]
      });
    }
    
    await client.query('BEGIN');
    
    // Delete user's appointments first
    await client.query('DELETE FROM appointments WHERE user_id = $1', [id]);
    
    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    console.log(`✅ User ${id} deleted successfully`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  } finally {
    client.release();
  }
});

// Clinic Managers management
router.get('/clinic-managers', async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        CASE 
          WHEN role = 'clinic_manager' THEN 'active'
          WHEN role = 'clinic_manager_inactive' THEN 'inactive'
          ELSE 'unknown'
        END as status
      FROM users 
      WHERE role IN ('clinic_manager', 'clinic_manager_inactive')
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    const clinicManagers = result.rows.map(manager => ({
      ...manager,
      name: manager.first_name && manager.last_name 
        ? `${manager.first_name} ${manager.last_name}` 
        : manager.first_name || 'Unknown',
      joined: manager.created_at?.toISOString()?.split('T')[0] || null
    }));
    
    res.json(clinicManagers);
  } catch (error) {
    console.error('Get clinic managers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create clinic manager
router.post('/clinic-managers', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      email,
      first_name,
      last_name,
      firstName,
      lastName,
      password
    } = req.body;

    // Normalize names from either snake_case or camelCase payloads; allow defaults so creation doesn't fail on missing names
    const normalizedFirst = (first_name || firstName || '').trim();
    const normalizedLast = (last_name || lastName || '').trim();
    const safeFirst = normalizedFirst || 'Clinic';
    const safeLast = normalizedLast || 'Manager';

    // Require email; allow password to default if omitted
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const effectivePassword = (password || '').trim() || 'password123';

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    await client.query('BEGIN');

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(effectivePassword, 10);

    // Create clinic manager
    const result = await client.query(`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, 'clinic_manager')
      RETURNING id, email, first_name, last_name, role, created_at
    `, [email, hashedPassword, safeFirst, safeLast]);

    await client.query('COMMIT');

    const manager = result.rows[0];
    res.status(201).json({
      ...manager,
      name: `${manager.first_name} ${manager.last_name}`,
      status: 'active',
      joined: manager.created_at?.toISOString()?.split('T')[0] || null
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create clinic manager error:', error);
    res.status(500).json({ error: 'Server error while creating clinic manager' });
  } finally {
    client.release();
  }
});

// Update clinic manager
router.put('/clinic-managers/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email
    } = req.body;

    await client.query('BEGIN');

    // Update clinic manager
    const result = await client.query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, email = $3, updated_at = NOW()
      WHERE id = $4 AND role = 'clinic_manager'
      RETURNING id, email, first_name, last_name, role, created_at
    `, [first_name, last_name, email, id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Clinic manager not found' });
    }

    await client.query('COMMIT');

    const manager = result.rows[0];
    res.json({
      ...manager,
      name: `${manager.first_name} ${manager.last_name}`,
      status: 'active',
      joined: manager.created_at?.toISOString()?.split('T')[0] || null
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update clinic manager error:', error);
    res.status(500).json({ error: 'Server error while updating clinic manager' });
  } finally {
    client.release();
  }
});

// Deactivate clinic manager
router.patch('/clinic-managers/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;

    let updated;

    try {
      const result = await pool.query(`
        UPDATE users 
        SET role = 'clinic_manager_inactive', updated_at = NOW()
        WHERE id = $1 AND role = 'clinic_manager'
        RETURNING id, email, first_name, last_name, role
      `, [id]);
      updated = result.rows[0];
    } catch (err) {
      // If role column is constrained (enum), fall back to dropping manager access by reverting to user
      console.warn('Fallback deactivate to user role due to DB constraint:', err.message);
      const fallback = await pool.query(`
        UPDATE users
        SET role = 'user', updated_at = NOW()
        WHERE id = $1 AND role = 'clinic_manager'
        RETURNING id, email, first_name, last_name, role
      `, [id]);
      updated = fallback.rows[0];
    }

    if (!updated) {
      return res.status(404).json({ error: 'Clinic manager not found' });
    }

    res.json({ 
      message: 'Clinic manager deactivated successfully',
      manager: updated
    });
  } catch (error) {
    console.error('Deactivate clinic manager error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
