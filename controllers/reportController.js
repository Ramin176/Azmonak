const User = require('../models/User');
const PDFDocument = require('pdfkit-table');

// @desc    Generate and download a PDF report of users
// @route   GET /api/reports/users/:status
exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active'; // 'active' or 'inactive'
        
        // ۱. گرفتن لیست کاربران از دیتابیس
        const users = await User.find({ isActive: status }).select('name email subscriptionType createdAt').lean();

        // ۲. ساخت یک سند PDF جدید
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // تنظیم هدرها برای دانلود فایل
        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // اتصال خروجی PDF به response
        doc.pipe(res);

        // --- ۳. طراحی محتوای PDF ---
        
        // اضافه کردن فونت فارسی (باید فایل فونت را در پروژه داشته باشید)
        // فرض می‌کنیم یک پوشه fonts با فایل Vazirmatn.ttf دارید
        doc.registerFont('Vazir', 'fonts/Vazirmatn-Regular.ttf');
        doc.font('Vazir');

        // عنوان گزارش
        doc.fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, { align: 'center' });
        doc.moveDown();

        // ساخت جدول
        const table = {
            title: "لیست کاربران",
            headers: ["نام", "ایمیل", "نوع اشتراک", "تاریخ ثبت نام"],
            // تبدیل داده‌های کاربران به فرمت مورد نیاز جدول
            rows: users.map(user => [
                user.name,
                user.email,
                user.subscriptionType || 'free',
                new Date(user.createdAt).toLocaleDateString('fa-IR')
            ]),
        };
        
        // کشیدن جدول در سند
        await doc.table(table, {
            prepareHeader: () => doc.font('Vazir').fontSize(12),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font('Vazir').fontSize(10);
            },
        });
        
        // ------------------------

        // ۴. نهایی کردن و ارسال PDF
        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).send("Could not generate report.");
    }
};