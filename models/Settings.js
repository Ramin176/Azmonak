const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    duration: { type: String, required: true }, // e.g., '۱ هفته'
    price: { type: String, required: true },    // e.g., '۱۰۰ دالر'
    planKey: { type: String, required: true },  // e.g., 'weekly'
     questionLimit: { type: Number, required: true, default: 10 },
});

const SettingsSchema = new mongoose.Schema({
    // یک فیلد ثابت برای اینکه همیشه فقط یک سند تنظیمات داشته باشیم
    singleton: { type: String, default: 'main_settings', unique: true },
    
    paymentInstructions: { type: String, default: 'دستورالعمل پرداخت را اینجا وارد کنید.' },
    telegramLink: { type: String, default: 'https://t.me/ramin0121' },
    accountNumber: { type: String, default: '659285329538' },
    subscriptionPlans: [PlanSchema],
     aboutUsText: { 
        type: String, 
        default: 'متن پیش‌فرض درباره ما در اینجا قرار می‌گیرد. شما می‌توانید این متن را از پنل مدیریت ویرایش کنید.' 
    },
     deactivatedUserMessage: { 
        type: String, 
        default: 'حساب کاربری شما به دلیل نقض قوانین غیرفعال شده است. لطفا با پشتیبانی در تلگرام (@AzmoonakSupport) تماس بگیرید.' 
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);