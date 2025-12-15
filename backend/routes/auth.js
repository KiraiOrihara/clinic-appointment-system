const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../utils/database');
const { createSession, createAdminSession, destroySession } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle empty dateOfBirth - set to NULL if empty string
    const dobValue = dateOfBirth && dateOfBirth.trim() !== '' ? dateOfBirth : null;

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, date_of_birth, role) 
       VALUES ($1, $2, $3, $4, $5, $6, 'user') RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, phone, dobValue]
    );

    const user = result.rows[0];

    // Create session for new user
    createSession(req, user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user (PATIENT/USER only)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('LOGIN DEBUG - Request body:', { email, password: password ? '***' : 'undefined' });

    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = $1 AND role = \'user\'',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('LOGIN DEBUG - User not found or not authorized for email:', email);
      return res.status(400).json({ error: 'Invalid credentials or insufficient permissions' });
    }

    const user = result.rows[0];
    console.log('LOGIN DEBUG - User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('LOGIN DEBUG - Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create user session (not admin session)
    createSession(req, user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    await destroySession(req);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

// Admin/Clinic Manager login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // DEBUG: Log incoming request
    console.log('ADMIN LOGIN DEBUG - Request body:', { email, password: password ? '***' : 'undefined' });

    // Check if user exists and is admin or clinic_manager
    const result = await pool.query(
      "SELECT id, email, password, first_name, last_name, role FROM users WHERE email = $1 AND role IN ('admin', 'clinic_manager')",
      [email]
    );

    if (result.rows.length === 0) {
      console.log('ADMIN LOGIN DEBUG - User not found or not authorized for email:', email);
      return res.status(400).json({ error: 'Invalid credentials or insufficient permissions' });
    }

    const user = result.rows[0];
    // Normalize role to avoid trailing spaces / legacy values
    user.role = (user.role || '').trim();
    console.log('ADMIN LOGIN DEBUG - User found:', { id: user.id, email: user.email, role: user.role });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('ADMIN LOGIN DEBUG - Password match:', isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create admin session (separate from user session)
    createAdminSession(req, user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Server error during admin login' });
  }
});

// Get current user (session-based)
router.get('/me', (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'No session found' });
    }

    res.json({
      id: req.session.userId,
      email: req.session.userEmail,
      firstName: req.session.userFirstName,
      lastName: req.session.userLastName,
      role: req.session.userRole
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current admin (session-based)
router.get('/admin-me', (req, res) => {
  try {
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ error: 'No admin session found' });
    }

    res.json({
      id: req.session.adminId,
      email: req.session.adminEmail,
      firstName: req.session.adminFirstName,
      lastName: req.session.adminLastName,
      role: req.session.adminRole
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin logout
router.post('/admin-logout', async (req, res) => {
  try {
    await destroySession(req);
    res.json({ message: 'Admin logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ error: 'Server error during admin logout' });
  }
});

module.exports = router;
