require('dotenv').config();

// Simple test of delete endpoint
async function testDeleteEndpoint() {
  console.log('🧪 Testing delete endpoint...');
  
  try {
    // Test if delete route exists by checking the admin routes file
    const fs = require('fs');
    const adminRoutes = fs.readFileSync('./routes/admin.js', 'utf8');
    
    if (adminRoutes.includes('router.delete(\'/appointments/:id\'')) {
      console.log('✅ Delete route exists in admin.js');
    } else {
      console.log('❌ Delete route not found in admin.js');
    }
    
    // Check if adminService is properly exported
    const api = require('./services/api.js');
    if (api.adminService && api.adminService.deleteAppointment) {
      console.log('✅ deleteAppointment method exists in adminService');
    } else {
      console.log('❌ deleteAppointment method not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDeleteEndpoint();
