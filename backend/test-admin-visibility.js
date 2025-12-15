require('dotenv').config();

// Test complete appointment flow and admin visibility
async function testAppointmentFlow() {
  console.log('🧪 Testing complete appointment flow and admin visibility...');
  
  try {
    // Step 1: Login as regular user
    console.log('🔐 Step 1: Login as regular user...');
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

    // Step 2: Create appointment as user
    console.log('📅 Step 2: Create appointment as user...');
    const appointmentData = {
      clinicId: 1,
      service: 'Test Admin Visibility',
      date: '2024-12-19',
      time: '5:30 PM',
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin@test.com',
      phone: '555-999-1234',
      dateOfBirth: '1985-05-15',
      reason: 'Testing admin dashboard visibility',
      insurance: 'Test Insurance'
    };

    const appointmentResponse = await fetch('http://localhost:3001/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': userCookies || ''
      },
      body: JSON.stringify(appointmentData)
    });

    if (appointmentResponse.status !== 201) {
      const errorText = await appointmentResponse.text();
      throw new Error(`Appointment creation failed: ${errorText}`);
    }

    const createdAppointment = await appointmentResponse.json();
    console.log('✅ Appointment created successfully:', createdAppointment.id);
    console.log('📧 Email sent to:', createdAppointment.email);

    // Step 3: Login as admin
    console.log('👑 Step 3: Login as admin...');
    const adminLoginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arizarhenzon@gmail.com',
        password: 'admin123'
      }),
      redirect: 'manual'
    });

    if (adminLoginResponse.status !== 200) {
      throw new Error('Admin login failed');
    }

    const adminCookies = adminLoginResponse.headers.get('set-cookie');
    const adminLoginData = await adminLoginResponse.json();
    console.log('✅ Admin login successful:', adminLoginData.user.email);

    // Step 4: Check admin dashboard for appointments
    console.log('📊 Step 4: Check admin dashboard for appointments...');
    const adminAppointmentsResponse = await fetch('http://localhost:3001/api/admin/appointments', {
      method: 'GET',
      headers: {
        'Cookie': adminCookies || ''
      }
    });

    if (adminAppointmentsResponse.status !== 200) {
      const errorText = await adminAppointmentsResponse.text();
      throw new Error(`Admin appointments fetch failed: ${errorText}`);
    }

    const adminAppointments = await adminAppointmentsResponse.json();
    console.log(`✅ Admin can see ${adminAppointments.length} total appointments`);

    // Step 5: Verify our test appointment is visible to admin
    console.log('🔍 Step 5: Verify test appointment visibility...');
    const testAppointment = adminAppointments.find(apt => apt.id === createdAppointment.id);
    
    if (testAppointment) {
      console.log('✅ SUCCESS: Test appointment is visible in admin dashboard!');
      console.log('📋 Appointment details:', {
        id: testAppointment.id,
        patient: `${testAppointment.first_name} ${testAppointment.last_name}`,
        email: testAppointment.email,
        clinic: testAppointment.clinic_name,
        service: testAppointment.service,
        date: testAppointment.appointment_date,
        time: testAppointment.appointment_time
      });
    } else {
      console.log('❌ FAILURE: Test appointment NOT found in admin dashboard');
      console.log('📋 Available appointments:', adminAppointments.map(apt => ({
        id: apt.id,
        patient: apt.email,
        service: apt.service
      })));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAppointmentFlow();
