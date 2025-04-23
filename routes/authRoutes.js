const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

//Test route - Apply 'protect' middleware here
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;