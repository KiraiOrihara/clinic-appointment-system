require('dotenv').config();

// Test appointment creation to trigger the 500 error
async function testAppointmentCreation() {
  console.log('🧪 Testing appointment creation to trigger 500 error...');
  
  try {
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

    console.log('📤 Sending test appointment data:', testData);
    
    const response = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (response.status === 500) {
      console.log('❌ 500 Error confirmed - check server logs for details');
    } else {
      console.log('✅ Appointment created successfully');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
  }
}

// Run test
testAppointmentCreation();
