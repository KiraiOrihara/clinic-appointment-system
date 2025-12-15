require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;

// Simple test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/test to check`);
});

// Error handling
app.on('error', (err) => {
  console.error('Server error:', err);
});
