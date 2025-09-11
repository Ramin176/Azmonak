const Settings = require('../models/Settings');

// گرفتن تنظیمات
exports.getSettings = async (req, res) => {
    try {
        // همیشه اولین و تنها سند تنظیمات را پیدا کن
        let settings = await Settings.findOne({ singleton: 'main_settings' });
        if (!settings) {
            // اگر وجود نداشت، یکی با مقادیر پیش‌فرض بساز
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ msg: 'Server Error' }); }
};

// آپدیت کردن تنظیمات (فقط برای ادمین)
exports.updateSettings = async (req, res) => {
    try {
        // از $set استفاده می‌کنیم تا فقط فیلدهای موجود در req.body آپدیت شوند
        const settings = await Settings.findOneAndUpdate(
            { singleton: 'main_settings' }, 
            { $set: req.body }, 
            { new: true, upsert: true, runValidators: true }
        );
        res.json(settings);
    } catch (err) { 
        console.error("Update Settings Error:", err);
        res.status(500).json({ msg: 'Server Error' }); 
    }
};