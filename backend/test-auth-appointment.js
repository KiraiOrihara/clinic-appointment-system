require('dotenv').config();

// Test appointment creation with authentication
async function testAuthenticatedAppointment() {
  console.log('🧪 Testing authenticated appointment creation...');
  
  try {
    // First, try to login to get a session
    console.log('🔐 Logging in to get session...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'arizarhenzon322@gmail.com',
        password: 'password123' // You'll need to use actual credentials
      }),
      redirect: 'manual' // Don't follow redirects
    });

    console.log('🔐 Login status:', loginResponse.status);
    
    // Extract cookies from login response
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('🍪 Session cookies:', setCookieHeader);

    // Now test appointment creation with session
    const testData = {
      clinicId: 1,
      service: 'Test Consultation',
      date: '2024-12-15',
      time: '10:00 AM',
      firstName: 'Test',
      lastName: 'User',
      email: 'cuerboprince13@gmail.com',
      phone: '555-123-4567',
      dateOfBirth: '1990-01-01',
      reason: 'Test appointment',
      insurance: 'Test Insurance'
    };

    console.log('📤 Sending appointment with session...');
    
    const appointmentResponse = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': setCookieHeader || ''
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Appointment response status:', appointmentResponse.status);
    
    const responseText = await appointmentResponse.text();
    console.log('📥 Appointment response body:', responseText);
    
    if (appointmentResponse.status === 500) {
      console.log('❌ 500 Error found - check server logs for details');
    } else if (appointmentResponse.status === 401) {
      console.log('❌ Still 401 - session issue');
    } else {
      console.log('✅ Appointment created successfully');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuthenticatedAppointment();
