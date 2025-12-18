const db = require('../config/db');

// List favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT p.* 
      FROM products p
      JOIN favorites f ON p.id = f.product_id
      WHERE f.user_id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add favorite
exports.addFavorite = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    await db.execute('INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove favorite
exports.removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    await db.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
