const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    // ۱. گرفتن توکن از هدر
    const token = req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // ۲. بررسی و رمزگشایی توکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: 'Invalid token payload' });
    }

    // ۳. جستجوی کاربر در دیتابیس
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User not found, authorization denied' });
    }

    if (!user.isActive) {
      return res.status(403).json({
        msg: 'User is deactivated. Please contact support.',
        code: 'USER_DEACTIVATED'
      });
    }

    // ۴. افزودن اطلاعات کاربر به request برای مراحل بعدی
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // ادامه مسیر
    next();

  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ msg: 'Token is not valid' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token has expired' });
    }
    res.status(500).json({ msg: 'Server Error in Auth Middleware' });
  }
};
