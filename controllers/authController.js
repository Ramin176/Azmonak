const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    
    console.log(`--- REGISTER ATTEMPT for ${email} ---`);

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            console.log(`User ${email} already exists.`);
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        
        user = new User({
            name,
            email: email.toLowerCase(),
            password,
        });

        // Middleware در User.js پسورد را قبل از این مرحله هش می‌کند
        await user.save();
        console.log(`User ${email} saved successfully.`);

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse });
        
    } catch (err) {
        console.error("!!! ERROR in register controller:", err.message);
        res.status(500).json({ msg: 'Server error during registration' });
    }
};


// @desc    Login a user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    console.log(`--- LOGIN ATTEMPT for ${email} ---`);

    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log(`Login failed: User ${email} not found.`);
            return res.status(400).json({ msg: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`Login failed: Password mismatch for ${email}.`);
            return res.status(400).json({ msg: 'Invalid email or password' });
        }
        console.log(`Login successful for ${email}.`);
        
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        
        const userResponse = user.toObject();
        delete userResponse.password;

        // --- اصلاح اصلی اینجاست ---
        // حالا هم توکن و هم اطلاعات کامل کاربر را برمی‌گردانیم
        res.json({ token, user: userResponse });
        // -------------------------

    } catch (err) {
        console.error("!!! ERROR in login controller:", err.message);
        res.status(500).json({ msg: 'Server error during login' });
    }
};
// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
exports.getAllUsers = async (req, res) => {
    try {
        // ما پسورد را برنمی‌گردانیم
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/auth/users/:id/toggle-active
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.isActive = !user.isActive; // وضعیت را برعکس کن
        await user.save();
        res.json({ msg: 'User status updated', isActive: user.isActive });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // req.user.id توسط authMiddleware از توکن استخراج شده است
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
          user = await checkSubscriptionStatus(user);
        res.json(user);
    } catch (err) {
        console.error("!!! ERROR in getMe controller:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Forgot password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ msg: 'User with that email does not exist' });
        }

        // ۱. ساخت توکن ریست (کد ۶ رقمی)
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        // ۲. هش کردن توکن و ذخیره در دیتابیس
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // ۱۰ دقیقه اعتبار

        await user.save({ validateBeforeSave: false });

        const message = `شما درخواستی برای بازیابی رمز عبور خود داده‌اید. کد شما: ${resetToken}`;
        
        try {
            await sendEmail({
                email: user.email,
                subject: 'بازیابی رمز عبور آزمونک',
                message
            });
            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error("Email send error:", err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ msg: 'Email could not be sent' });
        }
    } catch (err) {
        console.error("!!! ERROR in forgotPassword:", err.message);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @desc    Reset password
exports.resetPassword = async (req, res) => {
    const { email, token, password } = req.body;
    try {
        // ۱. هش کردن توکنی که کاربر فرستاده
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        // ۲. پیدا کردن کاربر با ایمیل و توکن معتبر
        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        // ۳. تنظیم پسورد جدید و پاک کردن فیلدهای ریست
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ success: true, msg: 'Password reset successful' });
    } catch (err) {
        console.error("!!! ERROR in resetPassword:", err.message);
        res.status(500).json({ msg: 'Server error' });
    }
}