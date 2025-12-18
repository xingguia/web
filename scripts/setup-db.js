const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // 允许执行多条 SQL 语句
  };

  let connection;

  try {
    // 1. 连接到 MySQL Server (不指定数据库)
    console.log('正在连接到 MySQL...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('连接成功！');

    // 2. 读取 init.sql 文件
    const sqlPath = path.join(__dirname, '../init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // 3. 执行 SQL 脚本
    console.log('正在执行初始化脚本...');
    await connection.query(sql);
    
    console.log('✅ 数据库初始化完成！');
    console.log('数据库名:', process.env.DB_NAME);
    
  } catch (err) {
    console.error('❌ 初始化失败:', err);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
