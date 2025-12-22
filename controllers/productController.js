const db = require('../config/db');

exports.getProducts = async (req, res) => {
  const { category, search } = req.query;

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  try {
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  const { name, price, category, description } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  try {
    await db.execute('INSERT INTO products (name, price, category, description) VALUES (?, ?, ?, ?)', [name, price, category, description]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
