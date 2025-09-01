const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// تمام توابع را از userController وارد می‌کنیم
const { 
    getAllUsers, 
    toggleUserStatus, 
    activateSubscription 
} = require('../controllers/userController');

// تمام مسیرهای این فایل نیاز به احراز هویت دارند
router.use(authMiddleware);

// گرفتن لیست همه کاربران
router.get('/', getAllUsers);

// تغییر وضعیت یک کاربر
router.put('/:id/toggle-active', toggleUserStatus);

// فعال‌سازی اشتراک
router.post('/activate-subscription', activateSubscription);

module.exports = router;