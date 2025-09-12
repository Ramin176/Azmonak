const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // <-- برای خواندن توکن
const { downloadUsersReport } = require('../controllers/reportController');

// --- Middleware محافظ مخصوص پنل که از کوکی می‌خواند ---
const checkAdminAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        // به جای JSON، یک پیام خطا نمایش می‌دهیم چون این یک لینک مستقیم است
        return res.status(401).send('Authorization denied. Please log in to the admin panel.');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).send('Invalid token. Please log in again.');
    }
};
// ---------------------------------------------------

// حالا از middleware صحیح استفاده می‌کنیم
router.get('/users/:status', checkAdminAuth, downloadUsersReport);

module.exports = router;