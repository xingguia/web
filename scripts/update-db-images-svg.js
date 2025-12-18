const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateDatabaseImages() {
  const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  };

  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to database...');

    // Update to use .svg extensions
    const updates = [
        { name: 'iPhone 15', img: '/images/iphone.svg' },
        { name: 'MacBook Pro', img: '/images/macbook.svg' },
        { name: 'Sony WH-1000XM5', img: '/images/headphone.svg' },
        { name: 'Logitech MX Master 3S', img: '/images/mouse.svg' },
        { name: 'Kindle Paperwhite', img: '/images/kindle.svg' }
    ];

    // Also update default
    await connection.query(`ALTER TABLE products MODIFY COLUMN image_url VARCHAR(255) DEFAULT '/images/default.svg'`);

    for (const update of updates) {
        await connection.execute('UPDATE products SET image_url = ? WHERE name = ?', [update.img, update.name]);
    }
    
    console.log('✅ Updated product images to SVG paths!');

  } catch (err) {
    console.error('❌ Update failed:', err);
  } finally {
    if (connection) await connection.end();
  }
}

updateDatabaseImages();
