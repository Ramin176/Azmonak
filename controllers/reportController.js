const User = require('../models/User');
const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

// @desc    Generate and download a PDF report of users
// @route   GET /api/reports/users/:status
exports.downloadUsersReport = async (req, res) => {
    try {
        const status = req.params.status === 'active'; // 'active' or 'inactive'

        // ۱. گرفتن لیست کاربران
        const users = await User.find({ isActive: status })
            .select('name email subscriptionType createdAt')
            .lean();

        // ۲. ایجاد PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });

        const filename = `users-report-${req.params.status}-${new Date().toISOString().slice(0,10)}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // --- فونت فارسی ---
        const fontPath = path.resolve('./fonts/Vazirmatn-Regular.ttf');
        if (!fs.existsSync(fontPath)) throw new Error('Font file not found');
        doc.registerFont('Vazir', fontPath);
        doc.font('Vazir');

        // --- لوگو ---
        const logoPath = path.join(__dirname, '..', 'uploads', 'photo_2025-09-11_14-01-25.png'); // مسیر لوگو
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, doc.page.width - 100, 20, { width: 70 }); // راست‌چین لوگو
        }

        doc.moveDown(4);

        // --- عنوان و تاریخ ---
        doc.fontSize(20).text(`گزارش کاربران ${status ? 'فعال' : 'غیرفعال'}`, {
            align: 'right', // راست‌چین
            underline: true
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text(`تاریخ: ${new Date().toLocaleDateString('fa-IR')}`, {
            align: 'right'
        });

        doc.moveDown(2);

        // --- جدول ---
        const table = {
            headers: [
                { label: "نام", property: 'name', width: 120 },
                { label: "ایمیل", property: 'email', width: 150 },
                { label: "نوع اشتراک", property: 'subscriptionType', width: 80 },
                { label: "تاریخ ثبت نام", property: 'createdAt', width: '*' },
            ],
            datas: users.map(u => ({
                name: u.name,
                email: u.email,
                subscriptionType: u.subscriptionType || 'free',
                createdAt: new Date(u.createdAt).toLocaleDateString('fa-IR')
            })),
        };

        // جدول با راست‌چین کردن متن سلول‌ها
        doc.table(table, {
            prepareHeader: () => doc.font('Vazir').fontSize(12).fillColor('#000000'),
            prepareRow: (row, i) => doc.font('Vazir').fontSize(10).fillColor('#000000'),
            padding: 5,
            columnSpacing: 10,
            width: doc.page.width - 60,
            x: 30,
            align: 'right' // راست‌چین جدول
        });

        // پایان PDF
        doc.end();

    } catch (err) {
        console.error("Report Generation Error:", err);
        if (!res.headersSent) res.status(500).send("Could not generate report.");
    }
};
