const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // Protect all favorite routes

router.get('/', favoriteController.getFavorites);
router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);

module.exports = router;
