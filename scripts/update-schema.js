const db = require('../config/db');

async function updateSchema() {
  try {
    console.log('Checking for role column in users table...');
    // Check if column exists
    const [columns] = await db.execute("SHOW COLUMNS FROM users LIKE 'role'");
    
    if (columns.length === 0) {
      console.log('Adding role column to users table...');
      await db.execute("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
      console.log('Role column added successfully.');
    } else {
      console.log('Role column already exists.');
    }

    // Check if admin user exists, if not create one
    const [admins] = await db.execute("SELECT * FROM users WHERE role = 'admin'");
    if (admins.length === 0) {
        console.log('Creating default admin user...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await db.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', hashedPassword, 'admin']);
        console.log('Default admin user created: admin / admin123');
    }

    console.log('Schema update complete.');
    process.exit(0);
  } catch (error) {
    console.error('Schema update failed:', error);
    process.exit(1);
  }
}

updateSchema();