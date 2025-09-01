const express = require('express');
const router = express.Router();

// Middleware احراز هویت را وارد می‌کنیم
const authMiddleware = require('../middleware/auth');

// Controller را وارد می‌کنیم
const { submitExam, getMyExamHistory } = require('../controllers/examResultController');

// تمام مسیرهای این فایل محافظت شده هستند
router.use(authMiddleware);

// مسیر برای ثبت پاسخ‌های یک آزمون
router.post('/submit', submitExam);

// مسیر برای گرفتن تاریخچه آزمون‌های کاربر
router.get('/my-history', getMyExamHistory);


module.exports = router;