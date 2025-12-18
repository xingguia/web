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

    // 1. Add image_url column if not exists
    try {
        await connection.query(`ALTER TABLE products ADD COLUMN image_url VARCHAR(255) DEFAULT '/images/default.jpg'`);
        console.log('Added image_url column.');
    } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
            throw e;
        }
        console.log('image_url column already exists.');
    }

    // 2. Update existing products
    // Mapping based on the initial data inserted in init.sql
    // ('iPhone 15', ...),
    // ('MacBook Pro', ...),
    // ('Sony WH-1000XM5', ...),
    // ('Logitech MX Master 3S', ...),
    // ('Kindle Paperwhite', ...);
    
    const updates = [
        { name: 'iPhone 15', img: '/images/iphone.jpg' },
        { name: 'MacBook Pro', img: '/images/macbook.jpg' },
        { name: 'Sony WH-1000XM5', img: '/images/headphone.jpg' },
        { name: 'Logitech MX Master 3S', img: '/images/mouse.jpg' },
        { name: 'Kindle Paperwhite', img: '/images/kindle.jpg' }
    ];

    for (const update of updates) {
        await connection.execute('UPDATE products SET image_url = ? WHERE name = ?', [update.img, update.name]);
    }
    
    console.log('✅ Updated product images!');

  } catch (err) {
    console.error('❌ Update failed:', err);
  } finally {
    if (connection) await connection.end();
  }
}

updateDatabaseImages();
