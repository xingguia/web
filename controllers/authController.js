const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password || !email || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?', [username, email, phone]);
    
    if (rows.length > 0) {
      // Check specifically which field conflicts
      for (const user of rows) {
          if (user.username === username) return res.status(400).json({ message: 'Username already exists' });
          if (user.email === email) return res.status(400).json({ message: 'Email already exists' });
          if (user.phone === phone) return res.status(400).json({ message: 'Phone number already exists' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Store password as plain text per requirement to be visible in admin panel
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    await db.execute('INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)', [username, password, email, phone]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check user
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Check password
    // Support plain text (for new requirements) and bcrypt hash (legacy)
    let isMatch = false;
    if (user.password === password) {
        isMatch = true;
    } else {
        // Fallback to bcrypt check for existing hashed passwords
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            isMatch = false;
        }
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT Access Token (Short-lived)
    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '15m' // Reduced for security, client uses refresh token
    });

    // Generate Refresh Token (Long-lived)
    const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Store Refresh Token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.execute('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES (?, ?, ?)', [refreshToken, user.id, expiresAt]);

    res.json({ accessToken, refreshToken, role: user.role, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) return res.sendStatus(401);

  try {
    // Verify token exists in DB
    const [rows] = await db.execute('SELECT * FROM refresh_tokens WHERE token = ?', [token]);
    if (rows.length === 0) return res.sendStatus(403);

    // Verify signature
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);

      // Generate new Access Token
      // Note: We need to fetch username again or encode it in refresh token. 
      // For simplicity, we query user again or just use ID if enough.
      // Let's query user to be safe and get fresh data.
      db.execute('SELECT * FROM users WHERE id = ?', [user.id])
        .then(([users]) => {
           if (users.length === 0) return res.sendStatus(403);
           const currentUser = users[0];
           
           const newAccessToken = jwt.sign({ id: currentUser.id, username: currentUser.username }, process.env.JWT_SECRET, {
             expiresIn: '15m'
           });
           
           res.json({ accessToken: newAccessToken });
        })
        .catch(e => res.sendStatus(500));
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
