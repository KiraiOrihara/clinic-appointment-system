const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const pool = require('../utils/database');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('🔍 Profile endpoint called');
    console.log('👤 User from auth:', req.user);
    console.log('📋 Session:', req.session);
    
    if (!req.user || !req.user.id) {
      console.error('❌ No user ID found');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    console.log('🆔 User ID:', userId);
    
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      console.error('❌ User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    
    // Get appointment count for profile summary
    const appointmentCount = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE user_id = $1',
      [userId]
    );

    res.json({
      ...user,
      appointmentCount: parseInt(appointmentCount.rows[0].count)
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      phone,
      date_of_birth
    } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, phone = $3, date_of_birth = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone, date_of_birth, updated_at`,
      [first_name, last_name, phone, date_of_birth, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Get current user
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, userResult.rows[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user appointments
router.get('/appointments', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;

    let query = `
      SELECT a.*, c.name as clinic_name, c.address as clinic_address, c.phone as clinic_phone
      FROM appointments a
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.user_id = $1
    `;
    
    const params = [userId];

    if (status) {
      query += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC
               LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
