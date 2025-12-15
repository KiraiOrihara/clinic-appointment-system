require('dotenv').config();

// Debug profile endpoint with detailed logging
async function debugProfile() {
  console.log('🔍 Debugging profile endpoint...');
  
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

    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies);
    
    // Step 2: Test profile endpoint with detailed error handling
    console.log('👤 Testing profile endpoint...');
    const profileResponse = await fetch('http://localhost:3001/api/users/profile', {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    });

    console.log(`📡 Response status: ${profileResponse.status}`);
    console.log(`📡 Response headers:`, Object.fromEntries(profileResponse.headers.entries()));
    
    if (profileResponse.status === 500) {
      const errorText = await profileResponse.text();
      console.error('❌ Profile API 500 error:', errorText);
    } else if (profileResponse.status === 200) {
      const profile = await profileResponse.json();
      console.log('✅ Profile data retrieved:', profile);
    } else {
      const errorText = await profileResponse.text();
      console.error('❌ Profile API failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugProfile();
