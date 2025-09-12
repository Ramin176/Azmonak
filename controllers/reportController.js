const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

// @desc    Generate and download a PDF report of users
// @route   GET /api/reports/users/:status
exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active'; // 'active' or 'inactive'
        
        // ۱. گرفتن لیست کاربران از دیتابیس
        const users = await User.find({ isActive: status })
            .select('name email subscriptionType createdAt')
            .lean();

        // ۲. ساخت یک سند PDF جدید
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // تنظیم هدرها برای دانلود فایل
        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.setHeader('Content-type', 'application/pdf');

        // اتصال خروجی PDF به response
        doc.pipe(res);

        // --- ۳. فونت و لوگو ---
        const fontPath = path.resolve('./fonts/Vazirmatn-Regular.ttf');
        if (!fs.existsSync(fontPath)) throw new Error('Font file not found');
        doc.registerFont('Vazir', fontPath);
        doc.font('Vazir');

        // لوگو
        const logoPath = path.join(__dirname, '..', 'uploads', 'logo.png'); // مسیر لوگو را تغییر دهید
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width / 2 - 35, 20, { width: 70 });
        }

        // عنوان گزارش
        doc.moveDown(5);
        doc.fontSize(22).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center', underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, { align: 'center' });
        doc.moveDown(2);

        // --- ۴. آماده‌سازی جدول ---
        const table = {
            headers: [
                { label: "نام", property: 'name', width: 120, renderer: null },
                { label: "ایمیل", property: 'email', width: 150, renderer: null },
                { label: "نوع اشتراک", property: 'subscriptionType', width: 80, renderer: null },
                { label: "تاریخ ثبت نام", property: 'createdAt', width: '*', renderer: null },
            ],
            datas: users.map(user => ({
                name: user.name,
                email: user.email,
                subscriptionType: user.subscriptionType || 'free',
                createdAt: new Date(user.createdAt).toLocaleDateString('fa-IR')
            })),
        };

        doc.table(table, {
            prepareHeader: () => doc.font('Vazir').fontSize(12).fillColor('#000000'),
            prepareRow: (row, i) => {
                doc.font('Vazir').fontSize(10).fillColor('#000000');
            },
            padding: 5,
            columnSpacing: 10,
            width: doc.page.width - 60,
            x: 30,
        });

        // --- ۵. پایان PDF ---
        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        if (!res.headersSent) res.status(500).send("Could not generate report.");
    }
};
