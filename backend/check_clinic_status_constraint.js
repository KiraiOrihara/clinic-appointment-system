require('dotenv').config();
const pool = require('./utils/database');

async function checkClinicStatusConstraint() {
  try {
    console.log('Checking clinic status constraints...\n');
    
    // Check the table constraints
    const constraintQuery = `
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'clinics'::regclass AND contype = 'c'
    `;
    const constraintResult = await pool.query(constraintQuery);
    
    console.log('Clinic table constraints:');
    constraintResult.rows.forEach(constraint => {
      console.log(`- ${constraint.conname}: ${constraint.definition}`);
    });
    
    // Check current status values in the database
    const statusQuery = `
      SELECT DISTINCT status, COUNT(*) as count 
      FROM clinics 
      GROUP BY status
    `;
    const statusResult = await pool.query(statusQuery);
    
    console.log('\nCurrent status values in clinics table:');
    statusResult.rows.forEach(row => {
      console.log(`- ${row.status}: ${row.count} clinics`);
    });
    
    // Check if there's an ENUM type for status
    const enumQuery = `
      SELECT t.typname, e.enumlabel 
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typname LIKE '%clinic%status%'
    `;
    const enumResult = await pool.query(enumQuery);
    
    if (enumResult.rows.length > 0) {
      console.log('\nENUM values for clinic status:');
      enumResult.rows.forEach(row => {
        console.log(`- ${row.enumlabel}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking constraints:', error);
  } finally {
    await pool.end();
  }
}

checkClinicStatusConstraint();
