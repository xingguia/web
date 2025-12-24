const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser); // Admin create user
router.delete('/:id', userController.deleteUser);

module.exports = router;