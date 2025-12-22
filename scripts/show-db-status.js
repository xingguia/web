const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function showStatus() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('\n=== 📊 数据库当前状态 (MySQL Status) ===\n');

  // 1. Users
  const [users] = await connection.execute('SELECT id, username, created_at FROM users');
  console.log(`👤 用户总数: ${users.length}`);
  if (users.length > 0) {
      console.table(users.map(u => ({ ID: u.id, 用户名: u.username })));
  }

  // 2. Products
  const [products] = await connection.execute('SELECT id, name, price, category FROM products LIMIT 5');
  console.log(`\n📦 商品示例 (前5个):`);
  console.table(products.map(p => ({ ID: p.id, 名称: p.name, 价格: p.price, 分类: p.category })));

  // 3. Favorites
  // Note: favorites table uses composite primary key (user_id, product_id) in some versions, 
  // so we remove 'f.id' from selection to be safe.
  const [favorites] = await connection.execute(`
    SELECT u.username, p.name as product_name 
    FROM favorites f 
    JOIN users u ON f.user_id = u.id 
    JOIN products p ON f.product_id = p.id
  `);
  console.log(`\n❤️  收藏记录: ${favorites.length}`);
  if (favorites.length > 0) {
    console.table(favorites.map(f => ({ 用户: f.username, 收藏了: f.product_name })));
  } else {
    console.log("   (暂无收藏数据)");
  }

  console.log('\n========================================\n');
  await connection.end();
}

showStatus().catch(console.error);
