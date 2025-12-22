const db = require('../config/db');

async function migrate() {
  try {
    console.log('Checking users table columns...');
    const [columns] = await db.execute('SHOW COLUMNS FROM users');
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('email')) {
      console.log('Adding email column...');
      await db.execute('ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE');
    }

    if (!columnNames.includes('phone')) {
      console.log('Adding phone column...');
      await db.execute('ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE');
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
