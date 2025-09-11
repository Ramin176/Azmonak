
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Settings = require('../models/Settings');
// 1. تمام مدل‌های مورد نیاز را در بالا وارد می‌کنیم
const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Question = require('../models/Question');
// const QuestionType = require('../models/QuestionType'); // <-- مدل جدید


router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.redirect('/admin/login');
});


// 2. Middleware (نگهبان) را قبل از هر مسیری تعریف می‌کنیم
const checkAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/admin/login');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        // این قسمت جدید است
            if (user && user.role === 'admin') {
            req.user = decoded.user;
            next(); // فقط اگر کاربر ادمین بود، اجازه عبور بده
        } else {
            // اگر کاربر ادمین نبود، او را به صفحه لاگین برگردان
            // (می‌توانیم یک پیام خطا هم نشان دهیم)
            return res.redirect('/admin/login?error=auth');
        }
        next();
    } catch (err) {
        return res.redirect('/admin/login');
    }
};

// تمام مسیرهای این فایل از این به بعد نیاز به احراز هویت دارند
router.use(checkAuth);


// @route   GET /admin/settings
// @desc    Show the settings management page
router.get('/settings', checkAuth, async (req, res) => {
    try {
        let settings = await Settings.findOne({ singleton: 'main_settings' });
        if (!settings) {
            settings = {}; // اگر تنظیماتی وجود نداشت، یک آبجکت خالی بفرست
        }
        res.render('settings', {
            title: 'تنظیمات اپلیکیشن',
            settings: settings
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
// 3. حالا مسیرها را تعریف می‌کنیم

// @route   GET /admin/dashboard
router.get('/dashboard', checkAuth, async (req, res) => {
    try {
        // باید هر سه مورد را از دیتابیس بگیرید
        
        const categories = await Category.find();
        const courses = await Course.find().populate('category', 'name');
        const users = await User.find().select('-password'); // <-- این خط احتمالاً جا افتاده

        // و هر سه مورد را به صفحه ارسال کنید
        res.render('dashboard', { 
            title: 'داشبورد',
            categories, 
            courses,
            users // <-- این هم احتمالاً جا افتاده
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// @route   GET /admin/users
// @desc    Show users management page with search and filter
router.get('/users', checkAuth, async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status && status !== '') {
            query.isActive = (status === 'active');
        }
        
        // ۱. کاربران را از دیتابیس می‌خوانیم
        const users = await User.find(query).select('-password');

        // ۲. آنها را به صفحه ارسال می‌کنیم
        res.render('users', {
            title: 'مدیریت کاربران',
            users: users,          // <-- این خط بسیار مهم است و احتمالاً جا افتاده بود
            search: search || '',  // برای اینکه مقدار جستجوی قبلی در فیلد باقی بماند
            status: status || ''   // برای اینکه مقدار فیلتر قبلی در منو باقی بماند
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// @route   GET /admin/course/:id/questions
// @desc    Show the unified questions management page
router.get('/course/:id/questions', checkAuth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).send('دوره یافت نشد');
        }
        
        // ما دیگر نیازی به populate نداریم
        const questions = await Question.find({ course: req.params.id }).lean();
        
        res.render('questions', {
            title: `آزمون‌ساز: ${course.name}`,
            course: course,
            questions: questions // فقط لیست سوالات را می‌فرستیم
        });
    } catch (err) {
        // --- برای عیب‌یابی بهتر، خطای دقیق را در کنسول چاپ می‌کنیم ---
        console.error("!!! ERROR in /admin/course/:id/questions:", err);
        res.status(500).send("Server Error");
    }
});
// @route   GET /admin/about-us
// @desc    Show the "About Us" management page
router.get('/about-us', checkAuth, async (req, res) => {
    try {
        // ما همچنان داده‌ها را از همان مدل Settings می‌خوانیم
        let settings = await Settings.findOne({ singleton: 'main_settings' });
        if (!settings) {
            settings = {}; 
        }
        res.render('about-us', { // <-- به یک view جدید به نام about-us رندر می‌کنیم
            title: 'مدیریت صفحه درباره ما',
            settings: settings
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
// ... سایر مسیرها مثل login و logout که می‌توانند قبل از router.use(checkAuth) باشند
// برای سادگی، فعلا فرض می‌کنیم همه مسیرها محافظت شده هستند.

module.exports = router;