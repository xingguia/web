const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files using absolute path

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/favorites', favoriteRoutes);

// API Status route (moved from root to avoid conflict with static files)
app.get('/api/status', (req, res) => {
  res.send('Mini E-commerce API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
