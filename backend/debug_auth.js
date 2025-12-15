const bcrypt = require('bcryptjs');
const pool = require('./utils/database');

async function debugAuth() {
  try {
    console.log('=== DEBUG AUTH ===');
    
    // Check if user exists
    const result = await pool.query(
      'SELECT id, email, password, first_name, last_name, role, managed_clinic_id FROM users WHERE email = $1',
      ['admin@clinicbook.com']
    );
    
    console.log('User found:', result.rows.length > 0 ? 'YES' : 'NO');
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('User data:', {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        managed_clinic_id: user.managed_clinic_id,
        passwordHash: user.password
      });
      
      // Test password comparison
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log('Password test:', testPassword, '->', isMatch ? 'MATCH' : 'NO MATCH');
      
      // Test with different password formats
      const passwords = ['admin123', 'admin', 'password', 'Admin123'];
      for (const pwd of passwords) {
        const match = await bcrypt.compare(pwd, user.password);
        console.log(`Test "${pwd}":`, match ? 'MATCH' : 'NO MATCH');
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugAuth();
