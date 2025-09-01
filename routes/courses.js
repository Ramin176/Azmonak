const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // نگهبان را وارد می‌کنیم
const {
  createCategory,
  getCategories,
  createCourse,
  getCoursesByCategory,
  getAllCourses,
} = require('../controllers/courseController');

// --- Category Routes ---
// ایجاد دسته‌بندی جدید (فقط مدیر یا کاربر لاگین کرده)
router.post('/categories', authMiddleware, createCategory);
// مشاهده همه دسته‌بندی‌ها (برای همه آزاد است)
router.get('/categories', getCategories);


// --- Course Routes ---
// ایجاد دوره جدید (فقط مدیر یا کاربر لاگین کرده)
router.post('/', authMiddleware, createCourse);
router.get('/', getAllCourses);
// مشاهده دوره‌های یک دسته‌بندی خاص (برای همه آزاد است)
router.get('/category/:categoryId', getCoursesByCategory);

module.exports = router;