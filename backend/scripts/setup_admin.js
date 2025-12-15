const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = require('../utils/database');

async function setupAdmin() {
  try {
    const email = 'arizarhenzon@gmail.com';
    const password = 'Rhenzon123!';
    const firstName = 'Ariz';
    const lastName = 'Arhenzon';
    const phone = '+63 912 345 6789';

    console.log('Setting up admin account...');
    console.log('DB Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert or update admin user
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, phone)
       VALUES ($1, $2, $3, $4, 'admin', $5)
       ON CONFLICT (email) 
       DO UPDATE SET 
         password = $2,
         role = 'admin',
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, email, role, first_name, last_name`,
      [email, hashedPassword, firstName, lastName, phone]
    );

    console.log('✅ Admin account setup successful!');
    console.log('📧 Email:', email);
    console.log('👤 Name:', `${firstName} ${lastName}`);
    console.log('🔑 Role:', 'admin');
    console.log('🆔 User ID:', result.rows[0].id);
    console.log('');
    console.log('You can now login with:');
    console.log('Email: arizarhenzon@gmail.com');
    console.log('Password: Rhenzon123!');

    await pool.end();
  } catch (error) {
    console.error('❌ Error setting up admin account:', error);
    process.exit(1);
  }
}

setupAdmin();
