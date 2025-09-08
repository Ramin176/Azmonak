const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');

// تنظیمات Multer برای ذخیره فایل
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // محدودیت حجم فایل: ۱ مگابایت
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('questionImage'); // 'questionImage' نام فیلد در فرم HTML خواهد بود

// تابع برای چک کردن نوع فایل
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// @route   POST /api/upload
// @desc    Upload an image for a question
router.post('/', authMiddleware, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).json({ msg: err });
        } else {
            if (req.file == undefined) {
                res.status(400).json({ msg: 'Error: No File Selected!' });
            } else {
                // اگر آپلود موفق بود، آدرس URL عمومی فایل را برمی‌گردانیم
                res.json({
                    msg: 'File Uploaded!',
                    filePath: `/uploads/${req.file.filename}`
                });
            }
        }
    });
});

module.exports = router;