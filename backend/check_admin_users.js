require('dotenv').config();
const pool = require('./utils/database');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdminUser() {
  try {
    console.log('Checking for admin users...');

    // Check if admin users exist
    const adminUsersResult = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE role IN ('admin', 'clinic_manager')
      ORDER BY role, email
    `);

    console.log(`Found ${adminUsersResult.rows.length} admin/clinic_manager users:`);
    adminUsersResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.first_name} ${user.last_name}`);
    });

    // If no admin users exist, create a default admin
    if (adminUsersResult.rows.length === 0) {
      console.log('\nNo admin users found. Creating default admin user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const result = await pool.query(`
        INSERT INTO users (email, password, first_name, last_name, phone, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, email, first_name, last_name, role
      `, ['admin@clinicbook.com', hashedPassword, 'Admin', 'User', '(087) 811-0000', 'admin']);

      const adminUser = result.rows[0];
      console.log(`Created admin user: ${adminUser.email} (${adminUser.role})`);
      console.log('Login credentials: admin@clinicbook.com / admin123');
    }

    // Test the admin login query
    console.log('\nTesting admin login query...');
    const testResult = await pool.query(`
      SELECT id, email, password, first_name, last_name, role 
      FROM users 
      WHERE email = $1 AND role IN ($2, $3)
    `, ['admin@clinicbook.com', 'admin', 'clinic_manager']);

    console.log(`Query test result: ${testResult.rows.length} users found`);
    if (testResult.rows.length > 0) {
      const user = testResult.rows[0];
      console.log(`  - ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
      console.log(`  - Password hash exists: ${user.password ? 'Yes' : 'No'}`);
    }

  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    await pool.end();
  }
}

checkAndCreateAdminUser();
