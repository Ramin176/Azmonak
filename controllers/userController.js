const User = require('../models/User');

exports.activateSubscription = async (req, res) => {
    try {
        const { userId, plan } = req.body; // plan: 'weekly', 'monthly', etc.
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        let expiryDate = new Date();
        switch(plan) {
            case 'weekly': expiryDate.setDate(expiryDate.getDate() + 7); break;
            case 'monthly': expiryDate.setMonth(expiryDate.getMonth() + 1); break;
            case 'quarterly': expiryDate.setMonth(expiryDate.getMonth() + 3); break;
            case 'half_yearly': expiryDate.setMonth(expiryDate.getMonth() + 6); break;
            case 'yearly': expiryDate.setFullYear(expiryDate.getFullYear() + 1); break;
            default: return res.status(400).json({ msg: 'Invalid plan' });
        }

        user.subscriptionType = plan;
        user.subscriptionExpiresAt = expiryDate;
        await user.save();
        
        res.json({ msg: `Subscription activated for ${user.email} until ${expiryDate.toLocaleDateString()}` });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.activateSubscription = async (req, res) => {
    try {
        const { userId, plan } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        let expiryDate = new Date();
        if (plan === 'free') {
            user.subscriptionType = 'free';
            user.subscriptionExpiresAt = null;
        } else {
            switch(plan) {
                case 'one_month': expiryDate.setMonth(expiryDate.getMonth() + 1); break;
    case 'two_months': expiryDate.setMonth(expiryDate.getMonth() + 2); break;
    case 'three_months': expiryDate.setMonth(expiryDate.getMonth() + 3); break;
    case 'six_months': expiryDate.setMonth(expiryDate.getMonth() + 6); break;
    case 'one_year': expiryDate.setFullYear(expiryDate.getFullYear() + 1); break;
                    expiryDate.setMinutes(expiryDate.getMinutes() + 4);
                    break;
                default: return res.status(400).json({ msg: 'Invalid plan' });
            }
            user.subscriptionType = plan;
            user.subscriptionExpiresAt = expiryDate;
        }
        
        await user.save();
        res.json({ msg: 'Subscription updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.toggleUserStatus = async (req, res) => {
    try {
        // ID کاربر از پارامترهای URL خوانده می‌شود
        const user = await User.findById(req.params.id); 

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // وضعیت فعلی را برعکس می‌کنیم
        user.isActive = !user.isActive; 
        
        // کاربر را با وضعیت جدید ذخیره می‌کنیم
        await user.save(); 
        
        res.json({ msg: 'User status updated successfully' });
    } catch (err) {
        console.error("Error in toggleUserStatus:", err); // لاگ دقیق خطا
        res.status(500).json({ msg: 'Server error while toggling status' });
    }
};

// @desc    Update user details (name)
// @route   PUT /api/users/updatedetails
exports.updateUserDetails = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ msg: 'Name is required' });
        }
        
        // کاربر را پیدا کرده و فقط نام او را آپدیت می‌کنیم
        const user = await User.findByIdAndUpdate(req.user.id, { name: name }, {
            new: true, // آبجکت آپدیت شده را برگردان
            runValidators: true
        }).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.status(200).json(user);

    } catch (err) {
        console.error("Update Details Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// @desc    Update user password
// @route   PUT /api/users/updatepassword
exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        // ۱. کاربر را از دیتابیس پیدا می‌کنیم (این بار با پسورد)
        const user = await User.findById(req.user.id).select('+password');

        // ۲. پسورد قدیمی وارد شده را با پسورد ذخیره شده مقایسه می‌کنیم
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect old password' });
        }

        // ۳. پسورد جدید را در مدل ست می‌کنیم
        user.password = newPassword;
        
        // ۴. کاربر را ذخیره می‌کنیم (middleware هش کردن به صورت خودکار اجرا می‌شود)
        await user.save();

        res.status(200).json({ msg: 'Password updated successfully' });

    } catch (err) {
        console.error("Update Password Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};