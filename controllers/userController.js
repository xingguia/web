const db = require('../config/db');
const bcrypt = require('bcryptjs'); // Add bcrypt import

exports.getAllUsers = async (req, res) => {
  try {
    // Select more fields including sensitive ones (email, phone) to be shown on demand
    // Note: Password hash should ideally not be sent to frontend even for admins, 
    // but user requested "show password", so we'll include it but it will be hash.
    const [users] = await db.execute('SELECT id, username, email, phone, role, created_at, password FROM users');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, email, phone, role } = req.body;

  if (!username || !password || !email || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?', [username, email, phone]);
    
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists (username, email, or phone)' });
    }

    // Store password as plain text per requirement
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    
    // Default role is user unless specified as admin
    const validRole = (role === 'admin') ? 'admin' : 'user';

    await db.execute(
      'INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, ?)', 
      [username, password, email, phone, validRole]
    );

    res.status(201).json({ message: 'User created successfully' });
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