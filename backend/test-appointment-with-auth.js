require('dotenv').config();

// Test appointment creation with proper authentication
async function testAppointmentWithAuth() {
  console.log('🧪 Testing appointment creation with authentication...');
  
  try {
    // Step 1: Login with test user
    console.log('🔐 Logging in with test user...');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@clinicbook.com',
        password: 'test123456'
      }),
      redirect: 'manual'
    });

    console.log('🔐 Login status:', loginResponse.status);
    
    // Extract cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Got cookies:', cookies ? 'Yes' : 'No');

    if (loginResponse.status !== 200) {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.email);

    // Step 2: Create appointment with session
    const appointmentData = {
      clinicId: 1,
      service: 'Test Consultation',
      date: '2024-12-15',
      time: '10:00 AM',
      firstName: 'Test',
      lastName: 'User',
      email: 'cuerboprince13@gmail.com', // This should trigger the Resend issue
      phone: '555-123-4567',
      dateOfBirth: '1990-01-01',
      reason: 'Test appointment for debugging',
      insurance: 'Test Insurance'
    };

    console.log('📤 Creating appointment...');
    console.log('📧 Will send email to:', appointmentData.email);
    
    const appointmentResponse = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(appointmentData)
    });

    console.log('📥 Appointment response status:', appointmentResponse.status);
    
    const responseText = await appointmentResponse.text();
    console.log('📥 Appointment response body:', responseText);
    
    if (appointmentResponse.status === 500) {
      console.log('❌ 500 ERROR FOUND - This is the issue we need to fix!');
      console.log('🔍 Check server logs for detailed error information');
    } else if (appointmentResponse.status === 201) {
      console.log('✅ Appointment created successfully!');
      console.log('📧 Email should have been sent to:', appointmentData.email);
    } else {
      console.log('⚠️ Unexpected status:', appointmentResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

// Run the test
testAppointmentWithAuth();
