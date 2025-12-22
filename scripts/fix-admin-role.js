const db = require('../config/db');

async function fixAdminRole() {
  try {
    console.log('Fixing admin user role...');
    
    // Check if admin user exists
    const [users] = await db.execute("SELECT * FROM users WHERE username = 'admin'");
    
    if (users.length > 0) {
        console.log('Found user "admin". Updating role to "admin"...');
        await db.execute("UPDATE users SET role = 'admin' WHERE username = 'admin'");
        console.log('Successfully updated user "admin" to role "admin".');
    } else {
        console.log('User "admin" not found. Creating new admin user...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await db.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', hashedPassword, 'admin']);
        console.log('Created user "admin" with password "admin123".');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed to fix admin role:', error);
    process.exit(1);
  }
}

fixAdminRole();