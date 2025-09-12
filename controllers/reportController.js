const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active';
        const users = await User.find({ isActive: status }).select('name email subscriptionType createdAt').lean();

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        // ... (تنظیم هدرها)
        doc.pipe(res);

        // --- ۱. بررسی و ثبت فونت فارسی ---
        const fontPath = path.resolve('./fonts/Vazirmatn-Regular.ttf');
        console.log("Attempting to load font from:", fontPath); // لاگ برای دیباگ
        if (!fs.existsSync(fontPath)) {
            // اگر فونت پیدا نشد، یک خطای واضح ایجاد کن
            throw new Error(`Font file not found at path: ${fontPath}`);
        }
        doc.registerFont('Vazir', fontPath);
        // ------------------------------------

        // ... (کد لوگو)
 const logoPath = path.join(__dirname, '..', 'uploads', 'photo_2025-09-11_14-01-25.jpg');
        doc.image(logoPath, 30, 30, { width: 70 });
        doc.font('Vazir').fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR'), { align: 'center' });
        doc.moveDown(3);

        // ۲. حالا از فونت ثبت شده استفاده می‌کنیم
        doc.font('Vazir').fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.fontSize(10).text(new Date().toLocaleDateString('fa-IR'), { align: 'center' });
        doc.moveDown(3);

        const tableRows = users.map(user => [
            new Date(user.createdAt).toLocaleDateString('fa-IR'),
            user.subscriptionType || 'free',
            user.email,
            user.name
        ]);

        const table = {
            headers: ["تاریخ ثبت نام", "نوع اشتراک", "ایمیل", "نام"],
            rows: tableRows,
        };

        // ۳. در تنظیمات جدول هم از فونت Vazir استفاده می‌کنیم
        doc.table(table, {
            rtl: true,
            prepareHeader: () => doc.font('Vazir').fontSize(11).fillColor('white'),
            prepareRow: (row, indexColumn, indexRow, rectRow) => {
                doc.font('Vazir').fontSize(9).fillColor('black');
                if (indexRow % 2 === 0) doc.addBackground(rectRow, '#f5f5f5', 0.9);
            },
            headerColor: '#008080',
            headerOpacity: 1,
        });

        doc.end();

    } catch (err) {
        console.error("!!! Report Generation Error:", err);
        if (!res.headersSent) {
            res.status(500).send("Could not generate report.");
        }
    }
};