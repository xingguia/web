-- 创建数据库
CREATE DATABASE IF NOT EXISTS mini_ecommerce;
USE mini_ecommerce;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
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

-- 插入一些初始商品数据
INSERT INTO products (name, price, category, description) VALUES
('iPhone 15', 5999.00, 'Electronics', 'Latest Apple smartphone'),
('MacBook Pro', 12999.00, 'Electronics', 'Powerful laptop for professionals'),
('Sony WH-1000XM5', 2499.00, 'Audio', 'Noise cancelling headphones'),
('Logitech MX Master 3S', 699.00, 'Accessories', 'Ergonomic mouse'),
('Kindle Paperwhite', 998.00, 'Electronics', 'E-reader for book lovers');
