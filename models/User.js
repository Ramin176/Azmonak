const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // هر ایمیل باید یکتا باشد
  },
  password: {
    type: String,
    required: true,
  },
   isActive: { // این فیلد جدید
    type: Boolean,
    default: true, // به صورت پیش‌فرض، کاربر غیرفعال است
  },
   subscriptionType: { 
        type: String, 
        enum: ['free', 'one_month', 'two_months', 'three_months', 'six_months', 'one_year'],
        default: 'free' 
    },
    subscriptionExpiresAt: { 
        type: Date 
    },
     role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
resetPasswordExpire: Date,
});

UserSchema.pre('save', async function (next) {
    // اگر پسورد تغییر نکرده بود (مثلاً هنگام آپدیت نام)، کاری انجام نده
    if (!this.isModified('password')) {
        return next();
    }
    
    // اگر پسورد جدید یا تغییر کرده بود، آن را هش کن
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (error) {
        return next(error);
    }
});
module.exports = mongoose.model('User', UserSchema);

