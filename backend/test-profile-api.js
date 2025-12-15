require('dotenv').config();

// Test profile API endpoint
async function testProfileAPI() {
  console.log('🧪 Testing profile API endpoint...');
  
  try {
    // Step 1: Login as user
    console.log('🔐 Login as user...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@clinicbook.com',
        password: 'test123456'
      }),
      redirect: 'manual'
    });

    if (loginResponse.status !== 200) {
      throw new Error('User login failed');
    }

    const userCookies = loginResponse.headers.get('set-cookie');
    const loginData = await loginResponse.json();
    console.log('✅ User login successful:', loginData.user.email);

    // Step 2: Test profile endpoint
    console.log('👤 Testing profile endpoint...');
    const profileResponse = await fetch('http://localhost:3001/api/users/profile', {
      method: 'GET',
      headers: {
        'Cookie': userCookies || ''
      }
    });

    console.log(`📡 Response status: ${profileResponse.status}`);
    
    if (profileResponse.status === 200) {
      const profile = await profileResponse.json();
      console.log('✅ Profile data retrieved:');
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Phone: ${profile.phone || 'N/A'}`);
      console.log(`   DOB: ${profile.date_of_birth || 'N/A'}`);
      console.log(`   Address: ${profile.address || 'N/A'}`);
      console.log(`   Emergency: ${profile.emergency_contact || 'N/A'}`);
      console.log(`   Appointments: ${profile.appointmentCount || 0}`);
    } else {
      const errorText = await profileResponse.text();
      console.error('❌ Profile API failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfileAPI();
