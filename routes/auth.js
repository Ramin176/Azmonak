const express = require('express');
const router = express.Router();

// 1. Controller را import می‌کنیم
const { register, login, getAllUsers, toggleUserStatus, getMe ,forgotPassword, resetPassword } = require('../controllers/authController');

// 2. Middleware را فقط یک بار import می‌کنیم
const authMiddleware = require('../middleware/auth');

// --- مسیرهای عمومی ---
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
// @route   POST api/auth/register
// @desc    Register user
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user / Get token
router.post('/login', login);

router.get('/me', authMiddleware, getMe);
// --- مسیرهای محافظت شده (فقط برای ادمین) ---

// @route   GET api/auth/users
// @desc    Get all users (Admin)
router.get('/users', authMiddleware, getAllUsers);
router.put('/users/:id/toggle-active', authMiddleware, toggleUserStatus);
module.exports = router;