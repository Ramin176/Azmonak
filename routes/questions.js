const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  addQuestion,
  uploadQuestions,
  updateQuestion, // اضافه شود
  deleteQuestion, // اضافه شود
  deleteMultipleQuestions, // اضافه شود
  getRandomQuestions,
  getAllQuestionsForCourse ,
   getTrialQuestions

} = require('../controllers/questionController');
// 1. Middleware را وارد می‌کنیم
const authMiddleware = require('../middleware/auth');

// 3. تنظیمات Multer
const upload = multer({ dest: 'uploads/' });
router.get('/trial', getTrialQuestions);
// تمام مسیرهای این فایل نیاز به احراز هویت دارند
router.use(authMiddleware);

// --- مسیرهای API سوالات ---

// افزودن یک سوال جدید
router.post('/', addQuestion);

router.post('/random', getRandomQuestions);
router.get('/all/:courseId', getAllQuestionsForCourse);
// بارگذاری گروهی سوالات
// حالا courseId را از پارامترهای URL می‌گیریم
router.post('/upload/:courseId', upload.single('questionsFile'), uploadQuestions);

router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.post('/delete-multiple', deleteMultipleQuestions);



module.exports = router;