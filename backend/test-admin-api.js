require('dotenv').config();

// Test admin API endpoint directly
async function testAdminAPI() {
  console.log('🧪 Testing admin API endpoint...');
  
  try {
    // Step 1: Login as admin
    console.log('🔐 Login as admin...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arizarhenzon@gmail.com',
        password: 'admin123'
      }),
      redirect: 'manual'
    });

    if (loginResponse.status !== 200) {
      throw new Error('Admin login failed');
    }

    const adminCookies = loginResponse.headers.get('set-cookie');
    const adminLoginData = await loginResponse.json();
    console.log('✅ Admin login successful:', adminLoginData.user.email);

    // Step 2: Test admin appointments endpoint
    console.log('📊 Testing admin appointments endpoint...');
    const appointmentsResponse = await fetch('http://localhost:3001/api/admin/appointments', {
      method: 'GET',
      headers: {
        'Cookie': adminCookies || ''
      }
    });

    console.log(`📡 Response status: ${appointmentsResponse.status}`);
    
    if (appointmentsResponse.status === 200) {
      const appointments = await appointmentsResponse.json();
      console.log(`✅ Admin API returns ${appointments.length} appointments`);
      
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. ${apt.first_name} ${apt.last_name} (${apt.email}) - ${apt.clinic_name}`);
      });
    } else {
      const errorText = await appointmentsResponse.text();
      console.error('❌ Admin API failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPI();
