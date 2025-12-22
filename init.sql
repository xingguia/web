-- 创建数据库
CREATE DATABASE IF NOT EXISTS mini_ecommerce;
USE mini_ecommerce;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建刷新令牌表
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建收藏夹表
CREATE TABLE IF NOT EXISTS favorites (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 插入一些初始商品数据
INSERT INTO products (name, price, category, description) VALUES
('iPhone 15', 5999.00, 'Electronics', 'Latest Apple smartphone'),
('MacBook Pro', 12999.00, 'Electronics', 'Powerful laptop for professionals'),
('Sony WH-1000XM5', 2499.00, 'Audio', 'Noise cancelling headphones'),
('Logitech MX Master 3S', 699.00, 'Accessories', 'Ergonomic mouse'),
('Kindle Paperwhite', 998.00, 'Electronics', 'E-reader for book lovers');
