const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports =async  function (req, res, next) {
  // ۱. توکن را از هدر درخواست بگی
  const token = req.header('x-auth-token');

  // ۲. چک کن آیا توکن وجود دارد
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
   const user = await User.findById(decoded.user.id);
    if (!user) {
        return res.status(401).json({ msg: 'User not found, authorization denied' });
    }
    if (!user.isActive) {
        // اگر کاربر غیرفعال بود، یک خطای خاص برمی‌گردانیم
        return res.status(403).json({ msg: 'User is deactivated. Please contact support.', code: 'USER_DEACTIVATED' });
    }
  // ۳. توکن را اعتبارسنجی کن
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // اطلاعات کاربر را به درخواست اضافه کن
    next(); // اگر همه چیز درست بود، به مرحله بعد برو
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};