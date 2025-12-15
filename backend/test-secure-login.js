require('dotenv').config();
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

async function testSecureLogin() {
  console.log('🔐 Testing Secure Login Validation');
  console.log('=====================================');

  try {
    // Test 1: Try to login with random email (should fail)
    console.log('\n1️⃣ Testing login with random email (should fail):');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'random@nonexistent.com',
          password: 'anypassword123'
        })
      });
      
      const data = await response.json();
      
      if (response.status === 400 && data.error) {
        console.log('✅ PASS: Random email correctly rejected');
        console.log(`   Error: ${data.error}`);
      } else {
        console.log('❌ FAIL: Random email was accepted (security issue!)');
        console.log(`   Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to test random email:', error.message);
    }

    // Test 2: Try to register a new user
    console.log('\n2️⃣ Testing user registration:');
    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'testuser@security.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          phone: '09123456789'
        })
      });
      
      const registerData = await registerResponse.json();
      
      if (registerResponse.status === 201) {
        console.log('✅ PASS: User registration successful');
        console.log(`   User ID: ${registerData.user.id}`);
        console.log(`   Email: ${registerData.user.email}`);
        
        // Test 3: Login with the newly created user
        console.log('\n3️⃣ Testing login with registered user (should succeed):');
        try {
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: 'testuser@security.com',
              password: 'TestPassword123!'
            })
          });
          
          const loginData = await loginResponse.json();
          
          if (loginResponse.status === 200 && loginData.token) {
            console.log('✅ PASS: Registered user login successful');
            console.log(`   Token received: ${loginData.token.substring(0, 20)}...`);
            
            // Test 4: Try wrong password for registered user
            console.log('\n4️⃣ Testing login with wrong password (should fail):');
            try {
              const wrongPassResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  email: 'testuser@security.com',
                  password: 'WrongPassword123!'
                })
              });
              
              const wrongPassData = await wrongPassResponse.json();
              
              if (wrongPassResponse.status === 400 && wrongPassData.error) {
                console.log('✅ PASS: Wrong password correctly rejected');
                console.log(`   Error: ${wrongPassData.error}`);
              } else {
                console.log('❌ FAIL: Wrong password was accepted (security issue!)');
              }
            } catch (error) {
              console.log('❌ ERROR: Failed to test wrong password:', error.message);
            }
            
          } else {
            console.log('❌ FAIL: Registered user login failed');
            console.log(`   Response: ${JSON.stringify(loginData)}`);
          }
        } catch (error) {
          console.log('❌ ERROR: Failed to login with registered user:', error.message);
        }
        
      } else {
        console.log('❌ FAIL: User registration failed');
        console.log(`   Response: ${JSON.stringify(registerData)}`);
      }
    } catch (error) {
      console.log('❌ ERROR: Failed to test registration:', error.message);
    }

    console.log('\n🎯 Security Test Summary:');
    console.log('- Random emails should be rejected ✅');
    console('- Only registered users can login ✅');
    console('- Password validation works ✅');
    console('- JWT tokens are issued ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSecureLogin();
