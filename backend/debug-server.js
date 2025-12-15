require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test each route file individually
console.log('Testing route files...');

try {
  console.log('1. Testing auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
  
  console.log('2. Testing clinic routes...');
  const clinicRoutes = require('./routes/clinics');
  console.log('✅ Clinic routes loaded');
  
  console.log('3. Testing appointment routes...');
  const appointmentRoutes = require('./routes/appointments');
  console.log('✅ Appointment routes loaded');
  
  console.log('4. Testing admin routes...');
  const adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes loaded');
  
  // Add routes
  app.use('/api/auth', authRoutes);
  app.use('/api/clinics', clinicRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/admin', adminRoutes);

  // Test endpoints without authentication
  app.get('/api/test/users', async (req, res) => {
    try {
      const pool = require('./utils/database');
      // Simple query without last_login column
      const query = `
        SELECT 
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          updated_at
        FROM users 
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query);
      const users = result.rows.map(user => ({
        ...user,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.first_name || user.email || 'Unknown',
        status: 'active', // Default status since we don't have last_login
        joined: user.created_at?.toISOString()?.split('T')[0] || null
      }));
      
      res.json(users);
    } catch (error) {
      console.error('Test users error:', error.message);
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  });

  app.get('/api/test/clinics', async (req, res) => {
    try {
      const pool = require('./utils/database');
      const result = await pool.query('SELECT * FROM clinics ORDER BY name');
      res.json(result.rows);
    } catch (error) {
      console.error('Test clinics error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/test/appointments', async (req, res) => {
    try {
      const pool = require('./utils/database');
      const query = `
        SELECT 
          a.*,
          c.name as clinic_name,
          u.first_name,
          u.last_name
        FROM appointments a
        JOIN clinics c ON a.clinic_id = c.id
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 10
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Test appointments error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  console.log('✅ All routes loaded successfully');
  
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Full error:', error);
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Debug server working!' });
});

app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api/health to test`);
});

// Error handling
app.on('error', (err) => {
  console.error('Server error:', err);
});
