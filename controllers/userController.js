const db = require('../config/db');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, role, created_at FROM users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent deleting self (optional, but good practice)
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};