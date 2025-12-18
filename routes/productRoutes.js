const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/authMiddleware');

// Apply authentication middleware to all product routes (or specific ones)
// The requirements say "Login required to access product list"
router.get('/', authenticateToken, productController.getProducts);

module.exports = router;
