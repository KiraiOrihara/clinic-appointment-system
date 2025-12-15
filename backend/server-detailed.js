require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

console.log('🚀 Starting server with detailed logging...');

try {
  console.log('📁 Loading route files...');
  
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
  
  const clinicRoutes = require('./routes/clinics');
  console.log('✅ Clinic routes loaded');
  
  const appointmentRoutes = require('./routes/appointments');
  console.log('✅ Appointment routes loaded');
  
  const adminRoutes = require('./routes/admin');
  console.log('✅ Admin routes loaded');
  
  const app = express();
  
  console.log('🔧 Setting up middleware...');
  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  console.log('📂 Setting up static files...');
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  console.log('🛣️ Setting up routes...');
  app.use('/api/auth', authRoutes);
  app.use('/api/clinics', clinicRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
      error: 'Something went wrong!',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`🎉 Server running successfully on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Admin users: http://localhost:${PORT}/api/admin/users`);
    console.log('Free APIs only - no paid services required!');
  });
  
  console.log('✅ Server setup complete!');
  
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
