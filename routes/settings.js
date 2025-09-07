const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

// این مسیر برای اپلیکیشن است و نیازی به لاگین ندارد
router.get('/', getSettings);

// این مسیر برای پنل مدیریت است و باید محافظت شده باشد
router.put('/', authMiddleware, updateSettings);

module.exports = router;