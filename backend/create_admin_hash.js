const bcrypt = require('bcryptjs');

async function createHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test the hash
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Hash verification:', isMatch);
}

createHash().catch(console.error);
