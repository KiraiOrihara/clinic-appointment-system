require('dotenv').config();

// Test email delivery to actual patient address
async function testEmailDelivery() {
  console.log('🧪 Testing email delivery to actual patient address...');
  
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

    if (loginResponse.status !== 200) {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
      return;
    }

    const cookies = loginResponse.headers.get('set-cookie');
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.email);

    // Step 2: Create appointment with different time to avoid conflict
    const appointmentData = {
      clinicId: 1,
      service: 'Test Consultation',
      date: '2024-12-16', // Different date
      time: '2:00 PM',     // Different time
      firstName: 'Test',
      lastName: 'User',
      email: 'cuerboprince13@gmail.com', // Actual patient email
      phone: '555-123-4567',
      dateOfBirth: '1990-01-01',
      reason: 'Test email delivery verification',
      insurance: 'Test Insurance'
    };

    console.log('📤 Creating appointment...');
    console.log('📧 Email should be sent to:', appointmentData.email);
    
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
    
    if (appointmentResponse.status === 201) {
      console.log('✅ Appointment created successfully!');
      console.log('📧 Email should now be sent to actual patient:', appointmentData.email);
      console.log('🔍 Check Resend dashboard for email to:', appointmentData.email);
    } else if (appointmentResponse.status === 400) {
      console.log('⚠️ Time slot conflict, trying different time...');
      
      // Try with a completely different time
      appointmentData.time = '4:30 PM';
      
      const retryResponse = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify(appointmentData)
      });

      console.log('🔄 Retry status:', retryResponse.status);
      const retryText = await retryResponse.text();
      console.log('🔄 Retry response:', retryText);
      
      if (retryResponse.status === 201) {
        console.log('✅ Appointment created on retry!');
        console.log('📧 Email sent to:', appointmentData.email);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailDelivery();
